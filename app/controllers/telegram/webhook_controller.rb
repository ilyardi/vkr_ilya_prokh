module Telegram
    class WebhookController < Telegram::Bot::UpdatesController
        include Telegram::Bot::UpdatesController::MessageContext

        def message(message)
            reply_with :message, text: "Echo: #{message['text']}"
        end

        # def start!(word = nil, *other_words)
        # end

        def login!(login='', password='')
            user_valid = false
            user = User.find_by(email: login)
            user_valid = user.valid_password?(password) if user.present?

            if user_valid
                user.update(chat_id: chat['id'])
                respond_with :message, text: "Добрый день, #{user.name}, учетная запись подтверждена, с этого момента Вы будете получать уведомления в данный персональный чат, от системы Толик CRM" if user_valid
            else
                respond_with :message, text: "Неправильный логин или пароль!"
            end
            bot.delete_message chat_id: chat.dig('id'), message_id: update.dig('message','message_id')
        end
    end
end
