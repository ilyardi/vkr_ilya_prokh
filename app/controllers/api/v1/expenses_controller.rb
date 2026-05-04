module Api
  module V1
    class ExpensesController < BaseController
      def index
        filter = params[:search] || {}

        @order = params[:order]
        @order_by = params[:order_by]

        user_id = current_user.id

        @expenses = Expense.left_outer_joins(:expense_stage, :expense_purpose).includes(:expense_stage, :expense_type)
        @expenses = @expenses.where("expenses.status != 'decline'") if filter[:hide_closed].present?

        if filter[:show_all].present?
          allowed_types = ExpenseType.joins(:expense_stages).where("expense_stages.user_id = #{user_id}").pluck(:id)
          @expenses = @expenses.where("expenses.author_id = #{user_id} OR expenses.expense_type_id IN (?)", allowed_types)
        else
          @expenses = @expenses.where("(expenses.author_id = #{user_id} AND expense_stages.user_id IS NULL) OR expense_stages.user_id = #{user_id}")
          @expenses = @expenses.where(status: :at_work)
        end

        @expenses = @expenses.where('expenses.id = ?', filter[:number].to_i) if filter[:number].present?
        @expenses = @expenses.where("expense_stages.user_id = #{filter[:executor_id]} OR (expense_stages.user_id IS NULL AND expenses.author_id = #{filter[:executor_id]})") if filter[:executor_id].present?
        @expenses = @expenses.where('expenses.name ILIKE ?', "%#{filter[:name]}%") if filter[:name].present?
        @expenses = @expenses.where('expenses.description ILIKE ?', "%#{filter[:context]}%") if filter[:context].present?
        @expenses = @expenses.where(expense_counterparty_id: filter[:expense_counterparty_id]) if filter[:expense_counterparty_id].present?
        @expenses = @expenses.where('expenses.amount >= ?', filter[:amount_min]) if filter[:amount_min].present?
        @expenses = @expenses.where('expenses.amount <= ?', filter[:amount_max]) if filter[:amount_max].present?
        @expenses = @expenses.where(author_id: filter[:author_id]) if filter[:author_id].present?
        @expenses = @expenses.where(status: filter[:status]) if filter[:status].present?
        @expenses = @expenses.where(expense_type_id: filter[:expense_type_id]) if filter[:expense_type_id].present?
        @expenses = @expenses.where(expense_stage_id: filter[:expense_stage_id]) if filter[:expense_stage_id].present?
        # @expenses = @expenses.where(expense_purpose_id: filter[:expense_purpose_id]) if filter[:expense_purpose_id].present?
        @expenses = @expenses.where('expense_purposes.name IN (?)', filter[:expense_purposes]) if filter[:expense_purposes].present?
        @expenses = @expenses.where(expense_company_id: filter[:expense_company_id]) if filter[:expense_company_id].present?
        @expenses = @expenses.where(flow_rate: filter[:flow_rate]) if filter[:flow_rate].present?
        @expenses = @expenses.where(pay_type: filter[:pay_type]) if filter[:pay_type].present?
        @expenses = @expenses.where(created_at: filter[:created_at][0]..filter[:created_at][1].to_time.end_of_day) if filter[:created_at].present? && filter[:created_at][0].present?
        @expenses = @expenses.where(date_payment: filter[:date_payment][0]..filter[:date_payment][1].to_time.end_of_day) if filter[:date_payment].present? && filter[:date_payment][0].present?
        @expenses = @expenses.where(plan_date_payment: filter[:plan_date_payment][0]..filter[:plan_date_payment][1].to_time.end_of_day) if filter[:plan_date_payment].present? && filter[:plan_date_payment][0].present?
        @total_fee = @expenses.sum(:amount)
        @expenses = @expenses.order(@order_by => @order) if @order_by.present? && @order.present?
        @expenses = @expenses.page(page_param).per(per_param)
      end

      def show
        @expense = Expense.includes(:expense_stage).find(params[:id])
        can_check = @expense.expense_stage.user_id.present? ? current_user.id == @expense.expense_stage.user_id : current_user.id == @expense.author_id
        @expense.update_column(:checked_at, Time.now) if can_check && @expense.checked_at.nil?
      end

      def create
        in_params = expense_params
        in_params['author_id'] = current_user.id unless in_params['author_id'].present?
        in_params[:comment] = params[:comment] if params[:comment].present?

        @expense = Expense.new(in_params)

        ActiveRecord::Base.transaction do
          @expense.save
          if @expense.repeatable && @expense.errors.size == 0
            template_params = params[:frequency]
            expense_template = @expense.generate_template(unit: template_params[:unit], quantity: template_params[:quantity])
            if expense_template.errors.size > 0
              @expense.errors.add(:repeatable, "ошибка создания шаблона")
              raise ActiveRecord::Rollback
            end
          end
        end
        set_bad_request(@expense)
      end

      def create_by_plan
        @expense = Expense.find_by(id: params[:id], status: :plan)
        unless @expense.present?
          render status: :not_found
          return
        end
        @expense_by_plan = @expense.do_at_work
        set_bad_request(@expense_by_plan)
      end

      def update
        in_params = expense_params
        in_params[:comment] = params[:comment] if params[:comment].present?
        @expense = Expense.find(params[:id])
        @expense.update(in_params)
        set_bad_request(@expense)
      end

      def destroy
        @expense = Expense.find(params[:id])
        @expense.destroy
        set_bad_request(@expense)
      end

      def switch_checked
        @expense = Expense.find(params[:id])
        @expense.switch_checked
        set_bad_request(@expense)
      end

      def batch_update
        expense_ids = params[:expense_ids_selected]
        operation = params[:operation]
        @expenses = Expense.where(id: expense_ids)
        @errors = {}
        @expenses.each do |record|
          puts "#{record.id} --- #{operation}"
          case operation
          when 'confirm'
            record.try_approve(current_user.id)
          when 'decline'
            record.try_decline(current_user.id)
          end

          if record.errors.size > 0
            @errors[record.id] = record.errors
          end
        end
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
            render status: :bad_request
        end
      end

      def expense_params
        params.require(:expense).permit(
          :name,
          :description,
          :amount,
          :author_id,
          :expense_type_id,
          :expense_stage_id,
          :expense_purpose_id,
          :expense_company_id,
          :pay_type,
          :counterparty,
          :expense_counterparty_id,
          :date_payment,
          :plan_date_payment,
          :flow_rate,
          :repeatable,
          :status,
        )
      end
    end
  end
end
