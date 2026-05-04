require 'php'

module LBAuthable
  extend ActiveSupport::Concern

  included do
    include ::ActionController::Cookies
  end

  protected

    def authenticate_lb_manager!
      if lb_manager.nil?
        render status: 401, json: { error: "Unauthorized"}
      end
    end

    def lb_manager
      @lb_manager ||= begin
        if Rails.env.development?
          LbManager.first
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
            if m = data.match(/#{cookies["PHPSESSID"]}";i:1;s:\d+:"(.*?)"/)
              Rails.logger.warn "MATCH: #{m[1]}"
              return LbManager.find_by(login: m[1])
            end
          end

          # Rails.logger.warn "PHPSESSID=#{cookies["PHPSESSID"]}"
          # if sess = LbWebSession.find_by(session_id: cookies["PHPSESSID"])
          #   Rails.logger.warn "FOUND session: #{sess.to_json}"
          #   if m = sess.data.match(/a88fc7e96f5223d2eb614c1a7917f9a3__name.*?"(.*?)"/)
          #     Rails.logger.warn "FOUND match: #{m.to_json}"
          #     return LbManager.find_by(login: m[1])
          #   end
          # end

          # session_id = cookies["bc37b9703283"]
          # sess_path = "/var/lib/php/session/lbadmin/sess_#{session_id}"
          # begin
          #   s = File.read(sess_path)
          #   h = PHP.unserialize(s.force_encoding("ISO-8859-5"))
          # rescue => e
          #   Rails.logger.error "[LBAuthable] #{e.message}"
          #   Rails.logger.error "[LBAuthable] #{e.backtrace.join("\n----------")}"
          #   return nil
          # end
          # return LbManager.find_by(person_id: h["auth"]["authperson"])
        end
      end
    end

end
