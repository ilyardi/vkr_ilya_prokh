module Sms
  class Message < Base
    def send_code(phone, code)
      begin
        if Rails.env.development?
          return [true, ""]
        end

        @response = connection.get 'send', {phone: phone, text: "Ваш код: #{code}\nhttps://lk.teleset.plus"}
        resp_arr = @response.body.split(";")
        Rails.logger.warn("[send_code][#{phone}][#{code}] #{resp_arr.inspect}")

        if resp_arr[0] == 'accepted'
          return [true, ""]
        end

        ExceptionNotifier.notify_exception(RuntimeError.new("Errors in Sms send"), data: { params: { response: @response.body } })
        return [false, resp_arr[1]]
      rescue => exception
        ExceptionNotifier.notify_exception(RuntimeError.new("Errors in Sms send"), data: { params: {} })
      end

      return [false, "not available"]
    end

    def send_massage(phone, text)
      begin
        if Rails.env.development?
          return [true, ""]
        end

        @response = connection.get 'send', {phone: phone, text: "#{text}"}
        resp_arr = @response.body.split(";")
        Rails.logger.warn("[send_message][#{phone}][#{text}] #{resp_arr.inspect}")

        if resp_arr[0] == 'accepted'
          return [true, ""]
        end

        ExceptionNotifier.notify_exception(RuntimeError.new("Errors in Sms send message"), data: { params: { response: @response.body } })
        return [false, resp_arr[1]]
      rescue => exception
        ExceptionNotifier.notify_exception(RuntimeError.new("Errors in Sms send message"), data: { params: {} })
      end

      return [false, "not available"]
    end

    private

      def path_prefix
        'messages/v2'
      end
  end
end
