module Sms
  module Error
    class Base < Faraday::ClientError
      def json?
        /\bjson/.match?(headers['content-type'])
      end

      def parsed_response
        json? ? JSON.parse(body).deep_symbolize_keys : body
      end

      def headers
        @response[:headers]
      end

      def body
        @response[:body]
      end
    end
    class BadRequest < Base; end
    class Client < Base; end
    class Connection < Base; end
    class NotFound < Base; end
    class Server < Base; end

    module Handler
      def self.included(clazz)
        clazz.class_eval do
          clazz.rescue_from Error::Connection do |e|
            sms_respond(:service_unavailable)
          end

          clazz.rescue_from Error::NotFound do |e|
            sms_respond(:not_found)
          end

          clazz.rescue_from Error::BadRequest do |e|
            sms_respond(:bad_request)
          end

          clazz.rescue_from Error::Client do |e|
            sms_respond(:unprocessable_entity)
          end

          clazz.rescue_from Error::Server do |e|
            sms_respond(:internal_server_error)
          end
        end
      end

      private

        def sms_respond(status, data = nil)
          data = data || {error: "Service not available"}
          render json: data, status: status
        end
    end
  end

end
