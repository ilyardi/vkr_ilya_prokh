class SendNotification < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendNotification] #{exception.message}"
  end

  def perform(id)
    n = Notification.find(id)
    n.send_to_devices
  end
end
