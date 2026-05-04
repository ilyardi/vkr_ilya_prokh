module Merchants
  class SberbankResponse
    def initialize(result)
      @result = result
    end

    def success?
      @result.success?
    end

    def error?
      @result.error?
    end

    def data
      @result.data
    end

    def payment_url
      form_url
    end

    def order_id
      @result.order_id
    end

    def error_message
      @result.error_message
    end

    def method_missing(name, *attrs)
      key = camelize_string(name.to_s)
      data.key?(key) ? data[key] : super
    end

    private

      def camelize_string(string)
        string.gsub(/_([a-z])/) { $1.upcase }
      end
  end
end
