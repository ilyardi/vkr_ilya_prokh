module Merchants
  class Yookassa
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
        description: "#{params[:description]}",
        capture: true,
        merchant_customer_id: params[:client_id],
        metadata: {
          email: "#{params[:email]}",
          phone: "#{params[:phone]}",
          orderNumber: params[:order_number],
        },
      }

      if params[:payment_method_id].present?
        args[:payment_method_id] = params[:payment_method_id]
      else
        args[:confirmation] = {
          type: 'redirect',
          return_url: @approve_url
        }
      end

      res = client.post("payments") do |req|
        req.headers['Idempotence-Key'] = "#{params[:order_number]}"
        req.headers['Content-Type'] = 'application/json'
        req.body = args.to_json
      end
      Rails.logger.debug "[Yookassa#create_order] #{res.as_json}"
      ::Merchants::YookassaResponse.new(res)
    end

    def create_auto_order(client_id:, order_number:, amount:, email:, phone:, description:)
      args = {
        amount: {
          value: "#{amount.to_i}.00",
          currency: 'RUB',
        },
        receipt: {
          customer: {
            phone: "#{phone}",
            email: "#{email}",
          },
          tax_system_code: 3,
          items: [
            {
              description: "#{description}",
              amount: {
                value: "#{amount.to_i}.00",
                currency: 'RUB'
              },
              vat_code: 7,
              quantity: '1',
              payment_subject: 'service',
              payment_mode: 'full_payment',
            },
          ],
        },
        confirmation: {
          type: 'redirect',
          return_url: @approve_url
        },
        description: "#{description}",
        save_payment_method: true,
        capture: false,
        merchant_customer_id: client_id,
        metadata: {
          email: "#{email}",
          phone: "#{phone}",
          orderNumber: order_number,
        },
      }

      res = client.post("payments") do |req|
        req.headers['Idempotence-Key'] = order_number
        req.headers['Content-Type'] = 'application/json'
        req.body = args.to_json
      end
      Rails.logger.debug "[Yookassa#create_auto_order] #{res.as_json}"
      ::Merchants::YookassaResponse.new(res)
    end

    def order_status(order_id)
      res = client.get("payments/#{order_id}")
      ::Merchants::YookassaResponse.new(res)
    end

    def refund(order_id:, amount:)
      args = {
        amount: {
          value: amount,
          currency: "RUB"
        },
        payment_id: order_id,
        description: "Возврат тестового платежа",
      }

      res = client.post("refunds") do |req|
        req.headers['Idempotence-Key'] = order_id
        req.headers['Content-Type'] = 'application/json'
        req.body = args.to_json
      end
      Rails.logger.debug "[Yookassa#refund_auto_order] #{res.as_json}"
      ::Merchants::YookassaResponse.new(res)
    end

    def reverse(order_id)
      res = client.post("payments/#{order_id}/cancel") do |req|
        req.headers['Idempotence-Key'] = "#{order_id}_cancel"
        req.headers['Content-Type'] = 'application/json'
      end
      ::Merchants::YookassaResponse.new(res)
    end
  end
end
