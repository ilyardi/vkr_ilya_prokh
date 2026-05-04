module Api
  module Internal
    class PaymentsController < BaseController

      def index
        agrm_id = params[:agrm_id]
        @payments = LbPayment.confirmed.where(agrm_id: agrm_id).order('pay_date DESC').page(page).per(per_page)
        render
      end

    end
  end
end
