class SendLkPaymentToOfdJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendLkPaymentToOfdJob] #{exception.message}"
  end

  def perform(id)
    payment = LkPayment.find(id)
    payment.send_to_ofd
  end
end
