module AuthCall
    class Call
        def do_call(phone)
            begin
                if Rails.env.development?
                    return [true, "", '0000']
                end

                rest = Faraday.new(url: Settings.auth_call.url, headers: {'Content-Type' => 'application/json'})
                response = rest.post("/api/voice-password/send/") do |req|
                    req.body = {
                        security: { apiKey: Settings.auth_call.api_key },
                        number: phone,
                    }.to_json
                end

                return [false, 'service is unavailable'] unless response.status == 200

                body_response = JSON.parse(response.body)
                Rails.logger.warn("[call_response]: #{response.body}")

                return [true, '', body_response["code"]] if body_response["result"] == 'ok'
                return [false, body_response['error_code'], '']
            rescue => exception
                ExceptionNotifier.notify_exception(RuntimeError.new("Errors in AuthCall"), data: { params: {} })
            end
            return [false, 'exception', '']
        end
    end
end
