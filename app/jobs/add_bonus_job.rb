class AddBonusJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[AddBonusJob] #{exception.message}"
  end

  def perform(payment_id)
    payment = LkPayment.find(payment_id)
    Bonus.add_by_payment(payment)
  end
end
