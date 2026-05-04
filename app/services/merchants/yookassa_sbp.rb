module Merchants
  class YookassaSBP
    # https://yookassa.ru/developers/api#create_payment

    ORDER_STATUS_CREATED = 'pending'
    ORDER_STATUS_APPROVED = 'succeeded'
    ORDER_STATUS_CANCELED = 'canceled'
    ORDER_STATUS_WAITING = 'waiting_for_capture'

    def self.name
      'yookassa'
    end

    def initialize
      @approve_url = Settings.yookassa.approve_url
    end

    def client
      @client ||= Faraday.new(Settings.yookassa.url) do |conn|
        conn.request :basic_auth, Settings.yookassa.shop_id, Settings.yookassa.api_key
      end
    end

    def create_order(params)
      args = {
        amount: {
          value: "#{params[:amount].to_i}.00",
          currency: 'RUB',
        },
        receipt: {
          customer: {
            phone: "#{params[:phone]}",
            email: "#{params[:email]}",
          },
          tax_system_code: 3,
          items: [
            {
              description: "#{params[:description]}",
              amount: {
                value: "#{params[:amount].to_i}.00",
                currency: 'RUB'
              },
              vat_code: 7,
              quantity: '1',
              payment_subject: 'service',
              payment_mode: 'full_payment',
            },
          ],
        },
        payment_method_data: {
          type: "sbp"
        },
        confirmation: {
          type: 'qr',
        },
        description: "#{params[:description]}",
        capture: true,
        merchant_customer_id: params[:client_id],
        metadata: {
          email: "#{params[:email]}",
          phone: "#{params[:phone]}",
          orderNumber: params[:order_number],
        },
      }

      res = client.post("payments") do |req|
        req.headers['Idempotence-Key'] = "#{params[:order_number]}"
        req.headers['Content-Type'] = 'application/json'
        req.body = args.to_json
      end
      Rails.logger.debug "[YookassaSBP#create_order] #{res.as_json}"
      ::Merchants::YookassaSBPResponse.new(res)
    end

    def order_status(order_id)
      res = client.get("payments/#{order_id}")
      ::Merchants::YookassaSBPResponse.new(res)
    end

    def reverse(order_id)
      res = client.post("payments/#{order_id}/cancel") do |req|
        req.headers['Idempotence-Key'] = "#{order_id}_cancel"
        req.headers['Content-Type'] = 'application/json'
      end
      ::Merchants::YookassaSBPResponse.new(res)
    end
  end
end
