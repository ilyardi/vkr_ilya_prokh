class SendRootNotification < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendRootNotification] #{exception.message}"
  end

  def perform(id)
    n = RootNotification.find(id)
    n.send_pushes
  end
end
