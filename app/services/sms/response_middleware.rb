module Sms
  class ResponseMiddleware < Faraday::Middleware
    def call(request_env)
      @app.call(request_env).on_complete do |response_env|
        case response_env.status.to_i
        when 407
          raise Error::Connection, %{407 "Proxy Authentication Required "}
        when 404
          raise Error::NotFound, response_values(response_env)
        when 400
          raise Error::BadRequest, response_values(response_env)
        when 401...499
          raise Error::Client, response_values(response_env)
        when 500...599
          raise Error::Server, response_values(response_env)
        end
      end
    rescue Faraday::ConnectionFailed, Faraday::TimeoutError => err
      raise Error::Connection, err
    end

    def response_values(env)
      {status: env.status, body: env.body, headers: env.response_headers}
    end
  end
end