class SendRequestNotificationJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendRequestNotificationJob] #{exception.message}"
  end

  def perform(payload, bot_token, chat_id)
      bot = Telegram::Bot::Client.new(bot_token, 'bot')
      bot.send_message(chat_id: chat_id, text: payload, parse_mode: :html)
  end
end
  