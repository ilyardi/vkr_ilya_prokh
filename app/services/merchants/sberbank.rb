module Merchants
  class Sberbank
    # https://securepayments.sberbank.ru/wiki/doku.php/integration:api:rest:start

    ORDER_STATUS_CREATED = 0
    ORDER_STATUS_APPROVED = 2
    ORDER_STATUS_CANCELED = 3
    ORDER_STATUS_REFUND = 4
    ORDER_STATUS_DECLINED = 6

    def self.name
      'sberbank'
    end

    def initialize
      @approve_url = Settings.sberbank.approve_url
      @decline_url = Settings.sberbank.decline_url
      # @cancel_url  = Settings.sberbank.cancel_url
      @approve_auto_url = Settings.sberbank_auto.approve_url
      @decline_auto_url = Settings.sberbank_auto.decline_url
    end

    def client
      @client ||= SBRF::Acquiring::Client.new(
        username: Settings.sberbank.user,
        password: Settings.sberbank.pass,
        test: !Settings.sberbank.production
      )
    end

    def create_order(params)
      args = {
        currency:    643,
        returnUrl:   @approve_url,
        failUrl:     @decline_url,
        clientId:    params[:client_id],
        orderNumber: params[:order_number],
        amount:      (params[:amount] * 100).to_i,
        email:       "#{params[:email]}",
        phone:       "#{params[:phone]}",
        description: "#{params[:description]}",
      }
      if params[:features].present?
        args[:features] = params[:features]
      end

      res = client.register(args)
      Rails.logger.debug "[Sberbank#create_order] #{res.data}"
      ::Merchants::SberbankResponse.new(res)
    end

    def create_auto_order(client_id:, order_number:, amount:, email:, phone:, description:)
      params = {
        currency:    643,
        returnUrl:   @approve_auto_url,
        failUrl:     @decline_auto_url,
        clientId:    client_id,
        orderNumber: order_number,
        amount:      (amount * 100).to_i,
        email:       "#{email}",
        phone:       "#{phone}",
        description: "#{description}",
        # Это тут возможно не нужно ----
        # features:    "AUTO_PAYMENT",
        # ------------------------------
      }

      res = client.register(params)
      Rails.logger.debug "[Sberbank#create_auto_order] #{res.data}"
      ::Merchants::SberbankResponse.new(res)
    end

    def order_status(params)
      res = client.get_order_status_extended(params)
      ::Merchants::SberbankResponse.new(res)
    end

    def get_bindings(params)
      client.execute(path: '/payment/rest/getBindings.do', params: params)
    end

    def get_all_bindings(params)
      client.execute(path: '/payment/rest/getAllBindings.do', params: params)
    end

    def lock_binding(bindingId:)
      client.execute(path: '/payment/rest/unBindCard.do', params: { bindingId: bindingId })
    end

    def unlock_binding(bindingId:)
      client.execute(path: '/payment/rest/bindCard.do', params: { bindingId: bindingId })
    end

    def reverse(order_id:)
      client.execute(path: '/payment/rest/reverse.do', params: { orderId: order_id })
    end

    def refund(order_id:, amount:)
      client.execute(path: '/payment/rest/refund.do', params: { orderId: order_id, amount: (amount * 100).to_i })
    end


    def payment_order_binding(order_id:, binding_id:)
      params = {
        bindingId: binding_id,
        mdOrder: order_id
      }
      client.execute(path: '/payment/rest/paymentOrderBinding.do', params: params)
    end


    # def post(url, body)
    #   body ||= {}
    #   body[:username] = Settings.sberbank.user
    #   body[:password] = Settings.sberbank.pass
    #   Faraday.post(url, body)
    # end
  end
end
