class SendToLanbillingJob < ApplicationJob
  queue_as :payments

  def perform(id)
    payment = Payment.find(id)
    payment.send_to_lanbilling
  end
end
