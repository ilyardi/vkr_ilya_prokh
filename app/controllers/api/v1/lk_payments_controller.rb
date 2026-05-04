module Api
  module V1
    class LkPaymentsController < BaseController
      load_and_authorize_resource

      def index
        @order = params[:order] || 'desc'
        @order_by = params[:order_by] || 'created_at'
        filter = params.fetch(:search, {})
        filter[:status] = 'paid' if current_user.manager? || current_user.main_manager?

        @lk_payments = LkPayment.all
        @lk_payments = @lk_payments.where(source: filter[:source]) if filter[:source].present?
        @lk_payments = @lk_payments.where(id: filter[:payment_id]) if filter[:payment_id].present?
        @lk_payments = @lk_payments.where(status: filter[:status]) if filter[:status].present?
        @lk_payments = @lk_payments.where(order_id: filter[:order_id]) if filter[:order_id].present?
        @lk_payments = @lk_payments.search_by_created_at(filter[:created_at]) if filter[:created_at].present?

        if filter[:agrm_number].present?
          if agrm = LbAgreement.find_by(number: filter[:agrm_number]).presence
            @lk_payments = @lk_payments.where(agrm_id: agrm.agrm_id)
          else
            @lk_payments = @lk_payments.none
          end
        end

        @lk_payments = @lk_payments.order(@order_by => @order).page(page_param).per(per_param)
      end
    end
  end
end
