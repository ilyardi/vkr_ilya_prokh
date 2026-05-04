class BonusWithdrawn < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[BonusWithdrawn] #{exception.message}"
  end

  def perform(bonus_id)
    Bonus.find(bonus_id).withdrawn!
  end
end
