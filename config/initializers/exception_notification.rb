require 'exception_notification/rails'
require 'exception_notifier/telegram_notifier'

ExceptionNotification.configure do |config|
  # Ignore additional exception types.
  # ActiveRecord::RecordNotFound, Mongoid::Errors::DocumentNotFound, AbstractController::ActionNotFound and ActionController::RoutingError are already added.
  # config.ignored_exceptions += %w{ActionView::TemplateError CustomError}

  config.ignore_if do |exception, options|
    not Rails.env.production?
  end

  config.error_grouping = true

  # Notifiers =================================================================

  # if ENV['EXCEPTION_NOTIFIER'] == 'telegram'
  config.add_notifier :telegram, {
    app: 'Teleset LBackend',
    bot_token: '540619835:AAFL_jkfJY5y1Wwj7a635LXZySf6ssotja8',
    chat_ids: ENV.fetch("TELEGRAM_CHATS", "159448251,-687196317").split(","), # chat ids, can be collection
    auth_model_name: 'user' # like 'user' or 'admin'
  }
  # end
  # Email notifier sends notifications by email.
  # config.add_notifier :email, {
  #   :email_prefix         => "[ERROR] ",
  #   :sender_address       => %{"Notifier" <notifier@example.com>},
  #   :exception_recipients => %w{exceptions@example.com}
  # }

  # Campfire notifier sends notifications to your Campfire room. Requires 'tinder' gem.
  # config.add_notifier :campfire, {
  #   :subdomain => 'my_subdomain',
  #   :token => 'my_token',
  #   :room_name => 'my_room'
  # }

  # HipChat notifier sends notifications to your HipChat room. Requires 'hipchat' gem.
  # config.add_notifier :hipchat, {
  #   :api_token => 'my_token',
  #   :room_name => 'my_room'
  # }

  # Webhook notifier sends notifications over HTTP protocol. Requires 'httparty' gem.
  # config.add_notifier :webhook, {
  #   :url => 'http://example.com:5555/hubot/path',
  #   :http_method => :post
  # }
end
