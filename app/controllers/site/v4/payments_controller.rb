module Site
  module V4
    class PaymentsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent, only: [:create]

      def index
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 20).to_i
        @address = current_abonent.dogovors.confirmed.not_blocked.default.first!
        @payments = LbPayment.confirmed.where(agrm_id: @address.agrm_id).order('pay_date DESC').page(@page).per(@per)
      end

      def create
        test_phone = ['79858217424', '79035327090']
        unless Settings.payments.allow_pay.present? || test_phone.include?(current_abonent.phone)
          render json: {validation: {payment: {base: 'Система оплаты временно не работает, попробуйте позднее.'}}}
          return
        end

        agrm = LbAgreement.find_by(number: payment_params[:dogovor])
        unless agrm
          render json: {validation: {payment: {base: 'Договор не найден'}}}
          return
        end

        address = current_abonent.dogovors.not_blocked.find_by(agrm_id: agrm.agrm_id)

        payment = LkPayment.create({
          agrm_id:          agrm.agrm_id,
          amount:           payment_params[:amount],
          customer_name:    payment_params[:name],
          customer_email:   payment_params[:email],
          customer_phone:   payment_params[:phone],
          customer_address: payment_params[:address],
          description:      "Оплата за услуги связи",
          charge_bonus:     (address && address.confirmed?),
          provider:         Merchants.current.name,
          abonent:          current_abonent,
        })

        if payment.errors.present?
          render json: {validation: {payment: payment.errors}}
          return
        end

        if payment.errors.size > 0
          ex = RuntimeError.new('Errors in Payment#create')
          ExceptionNotifier.notify_exception(ex, data: { payment: payment, errors: payment.errors })
          render json: {validation: {payment: {base: 'Системная ошибка. Попробуйте позже.'}}}
          return
        end

        res = payment.create_provider_order!
        if res[:redirect_url]
          render json: { success: true, location: res[:redirect_url] }
        else
          render json: { validation: { payment: { base: res[:error] } } }
        end
      end

      private

      def payment_params
        params.require(:payment).permit(:dogovor, :amount, :name, :email, :phone, :address)
      end

    end
  end
end
