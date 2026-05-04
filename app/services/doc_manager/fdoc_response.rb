module DocManager
  class FdocResponse
    def initialize(result)
      @result = result
      @body = JSON.parse(result.body)
    end

    def success?
      @result.success?
    end

    def error?
      !@result.success?
    end

    def data
      @body
    end

    def doc_url
      @body["url"]
    end

    def error_message
      @body["message"]
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
