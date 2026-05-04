require 'net/http'
require 'net/http/digest_auth'

class IrcApi
  def self.payments(date = Date.today)
    date_str = date.strftime("%Y-%m-%d")
    self._get("http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/pays?date=#{date_str}")
  end

  def self.services
    self._get("http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/services")
  end

  def self.account_by_number(num)
    self._get("http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/accounts?accnr=#{num}")
  end

  def self.account_by_id(id)
    self._get("http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/accounts?accid=#{id}")
  end

  def self.update_account_service(id, old_s, new_s)
    url = URI("http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/accounts?accid=#{id}&old=#{URI.escape(old_s.to_json)}&new=#{URI.escape(new_s.to_json)}")
    self._post(url)
  end

  private

  def self.parse_response(body)
    JSON.parse(body) rescue raise("Bad response: #{body}")
  end

  def self._get(url)
    uri = URI(url)

    http = Net::HTTP.new(uri.host, uri.port)
    # if Rails.env.development?
    http.set_debug_output $stderr
    # end

    request = Net::HTTP::Get.new uri.request_uri
    response = http.request(request)

    if response.code == "401"
      digest_auth = Net::HTTP::DigestAuth.new
      auth = digest_auth.auth_header uri, response['www-authenticate'], 'GET'

      request = Net::HTTP::Get.new uri.request_uri
      request.add_field 'Authorization', auth

      response = http.request(request)
    end

    return parse_response(response.body)
  end

  def self._post(uri, data = {})
    http = Net::HTTP.new(uri.host, uri.port)
    # if Rails.env.development?
    http.set_debug_output $stderr
    # end

    request = Net::HTTP::Post.new uri.request_uri, 'Content-Type' => 'application/json'
    request.set_form_data(data)

    response = http.request(request)

    if response.code == "401"
      digest_auth = Net::HTTP::DigestAuth.new
      auth = digest_auth.auth_header uri, response['www-authenticate'], 'POST'

      request = Net::HTTP::Post.new uri.request_uri, 'Content-Type' => 'application/json'
      request.set_form_data(data)
      request.add_field 'Authorization', auth

      response = http.request(request)
    end

    return parse_response(response.body)
  end
end

# запрос состояния счета GET
# http://teleset:teleset%2B@off.irc-dubna.ru/webservice/api/accounts?accnr=9390010
# http://off.irc-dubna.ru/webservice/api/accounts?accid=41551

# изменение тарифа POST
# http://off.irc-dubna.ru/webservice/api/accounts?accid=41551&old={"servid": 9,"statgrp": 68,"servnam": "Антенна (кабельное ТВ)","price": 399,"tarservnam": "Антенна"}&new={"servid": 9,"statgrp":3181,"servnam": "Антенна (кабельное ТВ)","price": 370,"tarservnam": "Антенна (2польз.)"}

# Работает на пока на базе asrkp_test


# servs = IrcApi.services

# new_s = servs.detect{|s| s["statgrp"]==74}
# a = IrcApi.account_by_id(41551)


# IrcApi.update_account_service(41551, a[0], new_s)



