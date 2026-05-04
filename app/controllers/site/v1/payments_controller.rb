module Site
  module V1
    class PaymentsController < Site::V1::BaseController
      def index
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 100).to_i
        current_address = current_abonent.dogovors.not_blocked.find_by(default: true, confirmed: true)
        if current_abonent && current_address
          @payments = LbPayment.confirmed.where(agrm_id: current_address.agrm_id).order('pay_date DESC').page(@page).per(@per)
        else
          @payments = LbPayment.none.page(@page).per(@per)
        end
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

        provider = case payment_params[:provider]
        when "sberbank" then payment_params[:provider]
        when "sberbank_sbp" then "yookassa_sbp"
        else "yookassa"
        end

        address = current_abonent.dogovors.not_blocked.find_by(agrm_id: agrm.agrm_id)

        payment = LkPayment.create(
          agrm_id:          agrm.agrm_id,
          amount:           payment_params[:amount],
          customer_name:    payment_params[:name],
          customer_email:   payment_params[:email],
          customer_phone:   payment_params[:phone],
          customer_address: payment_params[:address],
          description:      "Оплата за услуги связи",
          charge_bonus:     (address && address.confirmed?),
          provider:         provider,
          abonent:          current_abonent,
          source:           payment_params[:source],
        )

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

      def create_promised
        agrm = LbAgreement.find_by(number: payment_params[:dogovor])
        unless agrm
          render json: {validation: {payment: {base: 'Договор не найден'}}}
          return
        end

        dogovor = current_abonent.dogovors.not_blocked.find_by(agrm_id: agrm.agrm_id)
        unless dogovor
          render json: {validation: {payment: {base: 'Договор не найден'}}}
          return
        end

        balance = agrm.balance
        if balance >= 0
          render json: {validation: {payment: {base: 'Доверительный платеж не требуется'}}}
          return
        end

        payment = LbPayment.create_promised(
          agrm_id: dogovor.agrm_id,
          amount: balance
        )

        unless payment
          render json: {validation: {payment: {base: 'Ошибка создания платежа. Попробуйте позже'}}}
        else
          render json: { success: true }
        end
      end

      private

      def payment_params
        params.require(:payment).permit(:dogovor, :amount, :name, :email, :phone, :address, :provider, :source)
      end

    end
  end
end
