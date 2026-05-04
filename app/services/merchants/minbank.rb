require "addressable/uri"

module Merchants
  class Minbank
    ORDER_STATUS_APPROVED = "APPROVED"
    ORDER_STATUS_CANCELED = "CANCELED"
    ORDER_STATUS_DECLINED = "DECLINED"

    def self.name
      'minbank'
    end

    # Status 30
    class BadRequestError < Faraday::ClientError; end
    # Status 10
    class AccessDenyError < Faraday::ClientError; end
    # Status 54
    class UnknownError < Faraday::ClientError; end
    # Status 96
    class SystemError < Faraday::ClientError; end

    def initialize
      @merchant_id = Settings.minbank.merchant_id
      @connection_host = Settings.minbank.url
      @approve_url = Settings.minbank.approve_url
      @cancel_url  = Settings.minbank.cancel_url
      @decline_url = Settings.minbank.decline_url
    end

    def connection
      ssl_opts = {
        client_cert: OpenSSL::X509::Certificate.new(File.read(Settings.minbank.cert)),
        client_key: OpenSSL::PKey::RSA.new(File.read(Settings.minbank.key)),
        verify: false,
      }
      @connection ||= Faraday.new @connection_host, ssl: ssl_opts do |c|
        c.headers['Content-Type'] = 'application/xml'
        c.response :xml, content_type: /\bxml/
        c.response :logger, ::Logger.new(STDOUT), bodies: true
        c.adapter  Faraday.default_adapter
      end
    end

    def transaction_log
      payload = {
        Request: {
          Operation: "TransactionLog",
          Language:  "RU",
          Merchant: @merchant_id,
          # TerminalID: "TERM_1",
        }
      }
      execute(payload)
    end

    # r = Merchants::Minbank.new.create_order({amount: 1234, description: "оплата по тарифу", email: 'test@test.ru', phone: '+79033334455'})

    def create_order(params)
      payload = {
        Request: {
          Operation: "CreateOrder",
          Language:  "RU",
          Order: {
            OrderType:   "Purchase",
            Merchant:    @merchant_id,
            Amount:      "#{params[:amount].to_i}",
            Currency:    "643",
            Description: "#{params[:description]}",
            ApproveURL:  "#{@approve_url}",
            CancelURL:   "#{@cancel_url}",
            DeclineURL:  "#{@decline_url}",
            email: "#{params[:email]}",
            phone: "#{params[:phone]}",
          },
        }
      }
      ::Merchants::MinbankResponse.new(execute(payload))
    end

    def order_status(order_id, session_id)
      payload = {
        Request: {
          Operation: "GetOrderStatus",
          Language:  "RU",
          Order: {
            Merchant: @merchant_id,
            OrderID: "#{order_id}",
          },
          SessionID: "#{session_id}"
        }
      }
      execute(payload).Order
    end

    def orders(from, to)
      payload = {
        Request: {
          Operation: "GetOrders",
          Language:  "RU",
          Merchant: @merchant_id,
          OrdersFilter: {
            Period: {
              Start: from.strftime('%Y-%m-%d %H:%M:%S'),
              End: from.strftime('%Y-%m-%d %H:%M:%S'),
            },
            # LastCount: "2",
            # StartFrom: "1",
          },
        }
      }
      execute(payload).Orders
    end

    def build_payment_url(order)
      sid = order["SessionID"]
      oid = order["OrderID"]
      uri = ::Addressable::URI.parse(order["URL"])
      uri.query_values = {
        SESSIONID: sid,
        ORDERID:   oid,
      }.merge(uri.query_values || {})
      uri.to_s
    end

    def execute(payload)
      response = connection.post('Exec', (payload.is_a?(Hash) ? payload.to_xml(root: "TKKPG") : payload))
      json = response.body
      if !json || !json.is_a?(Hash)
        raise "Unknown response: #{json.inspect}"
      end
      response_hash = Hashie::Mash[json]

      case response_hash.TKKPG_.Response_.Status
        when "00" then response_hash.TKKPG.Response
        when "10" then raise Merchants::Minbank::AccessDenyError, response_hash
        when "30" then raise Merchants::Minbank::BadRequestError, response_hash
        when "54" then raise Merchants::Minbank::UnknownError, response_hash
        when "96" then raise Merchants::Minbank::SystemError, response_hash
        else response_hash
      end
    end

  end
end
