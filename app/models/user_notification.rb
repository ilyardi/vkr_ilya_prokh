class UserNotification < ApplicationRecord
    enum status: { created: 'created', sended: 'sended', readed: 'readed' }

    belongs_to :user

    # after_create :send_telegram, if !(self.status.sended?)

    def send_telegram
        user = self.user
        payload = "<b>#{self.data["title"]}</b> \n" + self.data["body"]
        return unless user.chat_id.present? && payload.present?

        SendTelegramNotificationJob.perform_now(user.chat_id, payload)
    end
end
