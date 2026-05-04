module Teledom
  class Api
    def client
      @client = Faraday.new("http://dom.teleset.plus/internal/teleset/")
    end

    def reports(from_date, to_date, address_params = {})
      query_params = {
        from: from_date,
        to: to_date
      }
      query_params.merge!(address_params.to_h.compact)

      # return ::Teledom::Response.new(nil) unless address_params.to_h.compact.any?
      address_hash = address_params.to_h.compact
      query_params.merge!(address_hash) if address_hash.any?

      res = client.get("reports/?#{URI.encode_www_form(query_params)}")
      ::Teledom::Response.new(res)
    end

    def all_addresses
      res = client.get("suggestions/?action=addresses")
      ::Teledom::Response.new(res)
    end

    def send_notification(phone, title, body)
      res = client.get("push/?phone=#{phone}&title=#{CGI.escape(title)}&body=#{CGI.escape(body.to_s)}")
      Rails.logger.debug "[TeledomNotification#send] #{res.body.as_json}"
    end

    def dom_info(agrm)
      # res = client.get("dogovor/?action=info&dogovor=#{CGI.escape(number)}")
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat]
      }
      res = client.get("dogovor/?action=info") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_sync(agrm)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        dogovor: params[:number],
        login: params[:login],
        password: params[:password],
        intercom_blocked: false,
      }
      res = client.post("dogovor?action=sync") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_de_sync(agrm)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        dogovor: params[:number],
        login: params[:login],
        password: params[:password],
        intercom_blocked: true,
      }
      res = client.post("dogovor?action=sync") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_svn_sync(agrm)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        dogovor: params[:number],
        login: params[:login],
        password: params[:password],
      }
      res = client.post("dogovor?action=sync") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_block(agrm)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
      }
      res = client.post("dogovor?action=block") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_unblock(agrm)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
      }
      res = client.post("dogovor?action=unblock") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_add_key(agrm, key, comment)
      tmp_key = key.size == 8 ? "000000" + key : key
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        key: tmp_key,
        comment: comment
      }
      res = client.post("dogovor?action=add_key") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_add_subscriber(agrm, phone, owner, name, middle, last)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        phone: phone,
        name: name,
        middle: middle,
        last: last,
        owner: owner
      }
      res = client.post("dogovor?action=add_subscriber") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end

    def dom_del_subscriber(agrm, phone)
      params = agrm.params_for_dom
      data = {
        street: params[:street],
        building: params[:building],
        flat: params[:flat],
        phone: phone,
      }
      res = client.post("dogovor?action=del_subscriber") do |req|
        req.body = data.to_json
      end
      ::Teledom::Response.new(res)
    end
  end
end
