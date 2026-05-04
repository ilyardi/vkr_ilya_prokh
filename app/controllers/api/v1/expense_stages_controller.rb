module Api
  module V1
    class ExpenseStagesController < BaseController
      def index
        filter = params[:search] || {}
        @expense_author = params[:author_id].present? ? User.find(params[:author_id]) : current_user
        @expense_stages = ExpenseStage.where(active: true)
        @expense_stages = @expense_stages.where(expense_type_id: filter[:expense_type_id]) if filter[:expense_type_id]
        @expense_stages = @expense_stages.order(priority: :asc)
      end

      def show
        @expense_stage = ExpenseStage.find(params[:id])
      end

      def create
        @expense_stage = ExpenseStage.create(expense_stage_params)
        set_bad_request(@expense_stage)
      end

      def update
        @expense_stage = ExpenseStage.find(params[:id])
        @expense_stage.update(expense_stage_params)
        set_bad_request(@expense_stage)
      end

      def destroy
        @expense_stage = ExpenseStage.find(params[:id])
        @expense_stage.update(active: false)
        set_bad_request(@expense_stage)
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
            render status: :bad_request
        end
      end

      def expense_stage_params
        params.require(:expense_stage).permit(:name, :alert_timer, :expense_type_id, :user_id, :active, :priority)
      end
    end
  end
end
