module Merchants
  class MinbankResponse
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
  end
end
