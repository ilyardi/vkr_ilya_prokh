module NotiSend
    class Sms
      def send_message(phone, message)
        begin
          rest = Faraday.new(url: "https://sms.notisend.ru", headers: {'Content-Type' => 'application/json'})
          response = rest.get("/api/message/send") do |req|
              req.body = {
                  project: "teleset",
                  recipients: phone,
                  message: message,
                  apikey: "0028df84577aae2d94e5fcf647f15614"
              }.to_json
          end

          body_response = JSON.parse(response.body)
          Rails.logger.warn("[notisend_send_message]: #{response.body}")
          if result["balance"].to_i > 990  && result["balance"].to_i < 1000
            ExceptionNotifier.notify_exception(RuntimeError.new("The service balance is less than 1000. Increase your service balance!"), data: { params: {} })
          end

          if ["enqueued","accepted","delivered","scheduled","wait", "success"].include?(body_response["status"])
            return [true, ""]
          end

          ExceptionNotifier.notify_exception(RuntimeError.new("Errors in NotiSend"), data: { params: { response: body_response } })
          return [false, body_response["message"]]
        rescue => exception
            ExceptionNotifier.notify_exception(RuntimeError.new("Errors in NotiSend::send_message"), data: { params: {} })
        end
        return [false, "not available"]
      end

      def send_code(phone, code)
        begin
          if Rails.env.development?
            return [true, ""]
          end

          rest = Faraday.new(url: "https://sms.notisend.ru", headers: {'Content-Type' => 'application/json'})
          response = rest.get("/api/message/send") do |req|
              req.body = {
                  project: "teleset",
                  recipients: phone,
                  message: "Ваш код: #{code}\nhttps://lk.teleset.plus",
                  apikey: "0028df84577aae2d94e5fcf647f15614"
              }.to_json
          end

          body_response = JSON.parse(response.body)
          Rails.logger.warn("[notisend_send_code]: #{response.body}")

          if ["enqueued","accepted","delivered","scheduled","wait", "success"].include?(body_response["status"])
            return [true, ""]
          end

          ExceptionNotifier.notify_exception(RuntimeError.new("Errors in NotiSend"), data: { params: { response: body_response } })
          return [false, body_response["message"]]
        rescue => exception
            ExceptionNotifier.notify_exception(RuntimeError.new("Errors in NotiSend::send_code"), data: { params: {} })
        end
        return [false, "not available"]
      end
    end
  end

# формат ответа https://notisend.ru/dev/sms/api/main/
# {"status"=>"success", "recipients"=>["79858217424"], "parts"=>1, "count"=>1, "price"=>"4,52", "balance"=>"10,96", "messages_id"=>[390788773], "test"=>0}
# {"status"=>"error", "error"=>"2", "message"=>"invalid signature or message encoding is not utf8"}

# Коды ошибок
# 1 - Параметр project пуст
# 2 - Не верная подпись запроса(параметр sign) или кодировка текста сообщения не utf8
# 3 - Параметр message пуст
# 4 - Параметр recipients пуст
# 5 - Проект с таким именем не найден
# 6 - Параметр recipients не содержит ни одного получателя
# 7 - Не достаточно денег на счету
# 8 - Параметр сендер пуст, содержит недопустимые символы или недопустимой длинны.
# 9 - Имя отправителя не проверено
# 10 - Проект выключен
