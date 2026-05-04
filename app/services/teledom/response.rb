module Teledom
  class Response
    def initialize(result)
      @result = result
      @body = JSON.parse(result.body)
    end

    def success?
      @result.success?
    end

    def data
      @body["data"]
    end

    def message
      @body["message"]
    end

    def blocked?
      data["blocked"]
    end

    def get_dom_info
      return false unless @result.success?
      dom = {
        blocked: @body["data"]["blocked"],
        intercom_blocked: @body["data"]["intercom_blocked"],
        admin_blocked:@body["data"]["admin_blocked"],
        keys: @body["data"]["keys"],
        dom_code: @body["data"]["open_code"],
        dogovor: @body["data"]["dogovor"],
        login: @body["data"]["login"],
        password: @body["data"]["password"],
        subscribers: @body["data"]["subscribers"],
        entrances: @body["data"]["entrances"]
      }
      dom
    end

    def get_keys
      data["keys"]
    end
  end
end
