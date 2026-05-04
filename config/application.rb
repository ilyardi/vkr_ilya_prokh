require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Lbackend
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    # config.load_defaults 5.2

    config.i18n.default_locale = 'ru'
    config.i18n.fallbacks =['ru', 'en']
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration can go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded after loading
    # the framework and any gems in your application.
    config.active_job.queue_adapter = :sidekiq

    config.time_zone = "Moscow"
    config.active_record.default_timezone = :local

    config.autoload_paths << "#{root}/lib/"

    # config.hosts += ["vm1.teleset.plus", "vm2.teleset.plus", "vm3.teleset.plus"]
     # config.hosts << "dev.teleset.plus"
    # config.relative_url_root = "/lb"

    config.hosts += ["vm1.teleset.plus", "vm2.teleset.plus", "vm3.teleset.plus"]

    config.lograge.enabled = ENV['DISABLE_LOGRAGE'] == 'false' ? false : true
    config.lograge.base_controller_class = ['ActionController::API', 'ActionController::Base']
    config.lograge.custom_payload do |controller|
      {
        user_id: controller.try(:current_user).try(:id),
        abonent_id: controller.try(:current_abonent).try(:id),
        params:  controller.params,
      }
    end
  end
end
