class Site::Payments::SberbankSbpController < Site::BaseController

  def notify
    Rails.logger.warn "SberbankSBP#notify: #{params.to_json}"
    @payment = LkPayment.lock.find_by(order_id: params[:orderId], provider: LkPayment::ProviderSberbankSbp)
    if @payment.nil?
      ExceptionNotifier.notify_exception(RuntimeError.new("[Sberbank Hook] Not found order_id"), data: { params: params })
      render plain: 'ok', status: 200
      return
    end

    @payment = @payment.check_provider_order
    render plain: 'ok', status: 200
  end

end
