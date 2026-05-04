module Api
  module V1
    class ExpenseTypesController < BaseController
      def index
          @expense_types = ExpenseType.active
          @expense_companies = ExpenseCompany.active
      end

      def create
          @expense_type = ExpenseType.create(expense_type_params)
          set_bad_request(@expense_type)
      end

      def destroy
          @expense_type = ExpenseType.find(params[:id])
          @expense_type.update(active: false)
          set_bad_request(@expense_type)
      end

      private

      def set_bad_request(model)
          if model.errors.size > 0
              render status: :bad_request
          end
      end

      def expense_type_params
        params.require(:expense_type).permit(:name)
      end
    end
  end
end
