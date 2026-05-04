module Api
  module V1
    class ExpenseCounterpartiesController < BaseController
      def index
          @expense_counterparties = ExpenseCounterparty.active
      end

      def create
          @expense_counterparty = ExpenseCounterparty.create(expense_counterparity_params)
          set_bad_request(@expense_counterparty)
      end

      def destroy
          @expense_counterparty = ExpenseCounterparty.find(params[:id])
          @expense_counterparty.update(active: false)
          set_bad_request(@expense_counterparty)
      end

      private

      def set_bad_request(model)
          if model.errors.size > 0
              render status: :bad_request
          end
      end

      def expense_counterparity_params
        params.require(:expense_counterparty).permit(:name, :inn, :active)
      end
    end
  end
end
