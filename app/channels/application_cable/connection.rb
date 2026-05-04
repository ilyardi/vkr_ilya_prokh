module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user, :current_manager

    def connect
      self.current_user = find_verified_user # || User.new #reject_unauthorized_connection
      self.current_manager = find_lb_manager # || LbManager.new
    end

    protected

    def find_verified_user
      app_cookies_key = Rails.application.config.session_options[:key] ||
        raise("No session cookies key in config")

      env['rack.session'] = cookies.encrypted[app_cookies_key]
      Warden::SessionSerializer.new(env).fetch(:user)
    end

    def find_lb_manager
      if Rails.env.development?
        LbManager.first #find_by(person_id: cookies["lb_manager_id"])
      else
        if sess = LbWebSession.find_by(session_id: cookies["PHPSESSID"])
          if sess.client_id != nil
            return LbManager.find_by(person_id: sess.client_id)
          end
        end
        if data = cookies["a88fc7e96f5223d2eb614c1a7917f9a3"]
          data = CGI.unescape(data)
          Rails.logger.warn "FIND_MANAGER: #{data}"
          Rails.logger.warn "PHPSESSID: #{cookies["PHPSESSID"]}"
          if m = data.match(/#{cookies["PHPSESSID"]};i:1;s:\d+:"(.*?)"/)
            Rails.logger.warn "MATCH: #{m[1]}"
            return LbManager.find_by(login: m[1])
          end
        end
      end
    end

  end
end
