class Site::BaseController < ActionController::API
  include ActionController::MimeResponds
  include ActionController::Cookies

  respond_to :json
  before_action :set_exception_data

  protected
    def set_exception_data
      request.env['exception_notifier.exception_data'] ||= {}
      request.env['exception_notifier.exception_data'][:request_ip] = request.remote_ip
    rescue => e
      rnd = rand(99999)
      Rails.logger.error "-"*80
      Rails.logger.error "[RND:#{rnd}] #{params}"
      Rails.logger.error "[RND:#{rnd}] #{e.message}"
      Rails.logger.error "[RND:#{rnd}] #{e.backtrace[0..5].join("\n")}"
      Rails.logger.error "="*80
    end

    def append_info_to_payload(payload)
      super
      payload[:request_ip] = request.remote_ip
    end

    def current_abonent
      @current_abonent ||= session[:abonent_id] && Abonent.find_by(id: session[:abonent_id])
    end
end
