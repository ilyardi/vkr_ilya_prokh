module Sms
  class Base

    private

      def connection
        @connection ||= Faraday.new(Settings.iqsms.url) do |conn|

          conn.params = {
            login: Settings.iqsms.login,
            password: Settings.iqsms.pass,
          }

          conn.path_prefix = path_prefix

          conn.request  :multipart
          conn.request  :json
          conn.request  :url_encoded

          conn.response :json, :content_type => /\bjson$/
          conn.response :logger, ::Logger.new(STDOUT), bodies: true if Rails.env.development?

          # conn.use      Sms::ResponseMiddleware

          conn.adapter  Faraday.default_adapter
        end
      end

      def path_prefix
        nil
      end

      def handle_response
        @response.body
      end
  end
end
