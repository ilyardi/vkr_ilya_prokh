class Site::Payments::SberbankController < Site::BaseController

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
    @payment = LkPayment.lock.find_by(order_id: params[:orderId], provider: LkPayment::ProviderSberbank)
    if @payment.nil?
      ExceptionNotifier.notify_exception(RuntimeError.new("[Sberbank Hook] Not found order_id"), data: { params: params })
      redirect_to "/pay?status=error&code=404"
      return
    end

    @payment = @payment.check_provider_order
    case @payment.status
    when 'error'
      redirect_to "/pay?status=error&code=400"
    else
      redirect_to "/pay?status=#{@payment.status}"
    end
  end

end
