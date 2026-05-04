class SendTelegramNotificationJob < ApplicationJob
    queue_as :default
  
    rescue_from(ActiveRecord::RecordNotFound) do |exception|
      Rails.logger.error "[SendTelegramNotificationJob] #{exception.message}"
    end
  
    def perform(chat_id, payload)
        Telegram.bot.send_message(chat_id: chat_id, text: payload, parse_mode: :html)
    end
end