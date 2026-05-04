class SendLbPaymentJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendLbPaymentJob] #{exception.message}"
  end

  def perform(id)
    payment = LkPayment.find(id)
    payment.send_to_lanbilling
  end
end
