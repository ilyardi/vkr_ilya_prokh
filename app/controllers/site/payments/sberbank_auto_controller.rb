class Site::Payments::SberbankAutoController < Site::BaseController

  def approved
    perform
  end

  def cancel
    perform
  end

  def decline
    perform
  end

  private

  def perform
    @auto_payment_method = AutoPaymentMethod.lock.find_by(merchant_order_id: params[:orderId])
    if @auto_payment_method.nil?
      ExceptionNotifier.notify_exception(RuntimeError.new("[Sberbank Hook Auto Payment] Not found order_id"), data: { params: params })
      redirect_to "https://lk.teleset.plus/auto_payment"
      return
    end

    @auto_payment_method = @auto_payment_method.check_initial_order
    @auto_payment_method.reverse_initial_order if @auto_payment_method.confirmed?

    redirect_to "https://lk.teleset.plus/auto_payment"
  end

end
