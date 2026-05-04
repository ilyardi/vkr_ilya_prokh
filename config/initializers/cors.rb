# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # if Rails.env.production?
    origins 'teleset.plus', 'lk.teleset.plus', 'adm.teleset.plus', 'crm.teleset.plus', 'lk.teleset.local:3002', 'crm.teleset.local', 'teleset.local:3002'
    # else
    #   origins 'crm.teleset.local', 'teleset.local', 'lk.teleset.local:3002'
    # end

    resource('*', {
      headers: :any,
      methods: %i[get post put patch delete options head],
      credentials: true,
      expose: ['X-Total-Count'],
    })
  end
end

Rails.application.config.action_controller.forgery_protection_origin_check = false
