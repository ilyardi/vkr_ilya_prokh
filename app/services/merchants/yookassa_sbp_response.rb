module Merchants
  class YookassaSBPResponse
    def initialize(result)
      @result = result
      @body = JSON.parse(result.body)
    end

    def success?
      # @result.id.present?
      @result.success?
    end

    def error?
      !@result.success?
    end

    def data
      @body
    end

    def payment_url
      @body["confirmation"]["confirmation_data"] if @body["confirmation"].present?
    end

    def order_id
      @body["id"]
    end

    def error_message
      @body["error"]
    end

    # def error_party
    #   @result.cancellation_details&.party
    # end

    def order_status
      @body["status"]
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
