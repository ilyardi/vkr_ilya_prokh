class Site::Payments::YookassaController < Site::BaseController

  def approved
    perform
  end

  private

  def perform
    render json: {success: true}, status: 200

    payment_params = params[:object]

    @payment = LkPayment.lock.find_by(order_id: payment_params[:id], provider: [LkPayment::ProviderYookassa, LkPayment::ProviderYookassaSbp])

    if @payment.present?
      @payment = @payment.check_provider_order
      return
    end

    @auto_payment_method = AutoPaymentMethod.lock.find_by(merchant_order_id: payment_params[:id])
    if @auto_payment_method.nil?
      ExceptionNotifier.notify_exception(RuntimeError.new("[Yookassa Hook] Not found order_id"), data: { params: params })
      return
    end

    @auto_payment_method = @auto_payment_method.check_initial_order
    @auto_payment_method.reverse_initial_order if @auto_payment_method.confirmed?
  end
end
