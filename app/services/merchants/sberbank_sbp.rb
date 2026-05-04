# # https://api.sberbank.ru/prod/qr/order/v3


# # Получить токен для запросов
# # https://api.developer.sber.ru/how-to-use/token_oauth

module Merchants
  class SberbankSBP
    def self.name
      'sberbank_sbp'
    end

    def get_auth_token(scope)
      url = "#{Settings.sberbank_sbp.url}/prod/tokens/v2/oauth"
      auth = Base64.urlsafe_encode64("#{Settings.sberbank_sbp.client_id}:#{Settings.sberbank_sbp.client_secret}")
      rquid = SecureRandom.uuid.gsub('-','')

      data = {
        grant_type: 'client_credentials',
        scope: scope,
      }
      response = connection.post(url) do |req|
        req.headers['Content-Type'] = 'application/x-www-form-urlencoded'
        req.headers['rquid'] = rquid
        req.headers['Authorization'] = "Basic #{auth}"
        req.body = URI.encode_www_form(data)
      end

      if response.status == 200
        json = JSON.parse(response.body)
        Rails.logger.info "[SBER_SBP] oauth: #{json}"
        return Merchants::SberbankSBPResponse.new(json)
      end
      raise Faraday::ClientError, response.body
    end

    # {order_number: '1', client_id: '1', order_create_date: Time.now, description: "Услуги связи", amount: 10}
    # https://api.developer.sber.ru/product/PlatiQR/doc/v1/8024874223
    def create_order(params)
      rquid = SecureRandom.uuid.gsub('-','')
      token = get_auth_token('https://api.sberbank.ru/qr/order.create').access_token

      data = {
        rq_uid: rquid,
        rq_tm: Time.now.utc.strftime('%Y-%m-%dT%H:%M:%SZ'),
        member_id: "00002540",
        order_number: params[:order_number].to_s,
        order_create_date: params[:order_create_date].strftime('%Y-%m-%dT%H:%M:%SZ'),
        order_params_type: [
          {
            position_name: params[:description],
            position_count: 1,
            position_sum: params[:amount].to_i*100,
            position_description: params[:description],
          }
        ],
        id_qr: Settings.sberbank_sbp.terminal_id.to_s,
        order_sum: params[:amount].to_i*100,
        currency: "643",
        description: params[:description],
        sbp_member_id: '100000000111', # константа. Идентификатор банка-участника "ПАО СберБанк" в СБП
      }

      Rails.logger.info "[SBER_SBP] create_order.request: #{data}"

      response = connection.post(_urls[:creation]) do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers['rquid'] = rquid
        req.headers['Authorization'] = "Bearer #{token}"
        req.body = data.to_json
      end

      if response.status == 200
        json = JSON.parse(response.body)
        Rails.logger.info "[SBER_SBP] create_order.response: #{json}"
        return Merchants::SberbankSBPResponse.new(json)
      end
      raise Faraday::ClientError, response.body
    end

    def order_status(params)
      rquid = SecureRandom.uuid.gsub('-','')
      token = get_auth_token('https://api.sberbank.ru/qr/order.status').access_token

      data = {
        rq_uid: rquid,
        rq_tm: Time.now.utc.strftime('%Y-%m-%dT%H:%M:%SZ'),
        partner_order_number: params[:order_number].to_s,
        order_id: params[:order_id].to_s,
        tid: Settings.sberbank_sbp.terminal_id.to_s,
      }

      response = connection.post(_urls[:status]) do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers['rquid'] = rquid
        req.headers['Authorization'] = "Bearer #{token}"
        req.body = data.to_json
      end

      if response.status == 200
        json = JSON.parse(response.body)
        Rails.logger.info "[SBER_SBP] status: #{json}"
        return Merchants::SberbankSBPResponse.new(json)
      end
      raise Faraday::ClientError, response.body
    end

    # https://api.developer.sber.ru/product/PlatiQR/doc/v1/8024874253
    def registry(params)
      rquid = SecureRandom.uuid.gsub('-','')
      token = get_auth_token('auth://qr/order.registry').access_token

      data = {
        rqUid: rquid,
        rqTm: Time.now.utc.strftime('%Y-%m-%dT%H:%M:%SZ'),
        registryType: "REGISTRY",
        idQR: Settings.sberbank_sbp.terminal_id.to_s,
        startPeriod: params[:from].strftime('%Y-%m-%dT%H:%M:%SZ'),
        endPeriod: params[:to].strftime('%Y-%m-%dT%H:%M:%SZ'),
      }

      response = connection.post(_urls[:registry]) do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers['rquid'] = rquid
        req.headers['Authorization'] = "Bearer #{token}"
        req.body = data.to_json
      end

      if response.status == 200
        json = JSON.parse(response.body)
        Rails.logger.info "[SBER_SBP] registry: #{json}"
        return Merchants::SberbankSBPResponse.new(json)
      end
      raise Faraday::ClientError, response.body
    end

    def connection
      @connection ||= begin
        ssl_opts = {
            client_key: p12.key,
            client_cert: p12.certificate,
        }
        Faraday.new(ssl: ssl_opts) do |c|
          c.request :retry
          # c.request :logger
          # c.response(:logger) unless Rails.env.test?
          c.adapter  Faraday.default_adapter
          c.response :logger, ::Logger.new(STDOUT), bodies: true
        end
      end
    end

    private

    def p12
        OpenSSL::PKCS12.new(File.open(Settings.sberbank_sbp.cert_file, 'rb').read, Settings.sberbank_sbp.cert_pass)
    end

    def _urls
      stub = !Rails.env.production? ? "stub/" : ""
      {
        creation: "#{Settings.sberbank_sbp.url}/prod/qr/order/#{stub}v3/creation",
        status: "#{Settings.sberbank_sbp.url}/prod/qr/order/#{stub}v3/status",
        registry: "#{Settings.sberbank_sbp.url}/prod/qr/order/#{stub}v3/registry",
      }
    end
  end
end
