module Site
  module V1
    class AutoPaymentsController < Site::V1::BaseController
      def index
        @auto_payments = AutoPaymentMethod.where(agrm_id: params[:agrm_id], abonent_id: params[:abonent_id])
      end

      def create
        test_phone = ['79858217424', '79035327090']
        unless Settings.payments.allow_auto_pay.present? || test_phone.include?(current_abonent.phone)
          render json: {validation: {payment: {base: 'Система оплаты временно не работает, попробуйте позднее.'}}}
          return
        end

        date = Time.now.beginning_of_month + 1.month
        new_params = auto_payment_params
        new_params[:date] = date
        new_params[:service] = 'yookassa'
        @auto_payment = AutoPaymentMethod.create(new_params)
        if @auto_payment.errors.size > 0
          render json: { validation: { payment: @auto_payment.errors } }
          return
        end

        res = @auto_payment.create_initial_order!
        if res[:redirect_url]
          render json: { success: true, location: res[:redirect_url] }
        else
          render json: { validation: { payment: { base: res[:error] } } }
        end
      end

      def destroy
        auto_payment = AutoPaymentMethod.find(params[:id]).destroy
        render json: {success: true}
      end

      private

      def auto_payment_params
        params.require(:auto_payment).permit(:abonent_id, :agrm_id, :amount, :date, payer_data: [:name, :email, :phone, :address])
      end

    end
  end
end
