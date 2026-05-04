# https://api.developer.sber.ru/product/PlatiQR/doc/v1/8024874359
module Merchants
  class SberbankSBPResponse
    def initialize(result)
      @result = result
    end

    def success?
      error_code == "000000"
    end

    def error?
      error_code != "000000"
    end

    def data
      @result
    end

    def payment_url
      order_form_url
    end

    def error_message
      # @result.error_message
    end

    def order_status
      order_state
    end

    def paid?
      order_state == "PAID"
    end

    def cancelled?
      ["REVOKED", "EXPIRED"].include?(order_state)
    end

    def declined?
      order_state == "DECLINED"
    end

    def method_missing(name, *attrs)
      key = name.to_s
      data.key?(key) ? data[key] : super
    end

    private

      def camelize_string(string)
        string.gsub(/_([a-z])/) { $1.upcase }
      end
  end
end
