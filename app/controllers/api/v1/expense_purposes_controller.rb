module Api
  module V1
    class ExpensePurposesController < BaseController
      def index
        filter = params[:search] || {}
        @expense_purposes = ExpensePurpose.active
        @expense_purposes = @expense_purposes.where(expense_type_id: filter[:expense_type_id]) if filter[:expense_type_id]
      end

      def for_searching
        @expense_purposes = ExpensePurpose.active.pluck(:name).uniq
        render json: {expense_purposes: @expense_purposes}
      end

      def create
          @expense_purpose = ExpensePurpose.create(expense_purpose_params)
          set_bad_request(@expense_purpose)
      end

      def destroy
          @expense_purpose = ExpensePurpose.find(params[:id])
          @expense_purpose.update(active: false)
          set_bad_request(@expense_purpose)
      end

      private

      def set_bad_request(model)
          if model.errors.size > 0
              render status: :bad_request
          end
      end

      def expense_purpose_params
        params.require(:expense_purpose).permit(:name, :active)
      end
    end
  end
end
