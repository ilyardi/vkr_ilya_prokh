# Be sure to restart your server when you modify this file.

if Rails.env.production?
    Rails.application.config.session_store :cookie_store, key: '_teleset_plus_session', domain: '.teleset.plus'
else
    Rails.application.config.session_store :cookie_store, key: '_teleset_session', domain: :all
end
