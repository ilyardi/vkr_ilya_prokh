class SendOfdJob < ApplicationJob
  queue_as :payments

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendOfdJob] #{exception.message}"
  end

  def perform(id)
    payment = Payment.find(id)
    payment.send_to_ofd
  end
end
