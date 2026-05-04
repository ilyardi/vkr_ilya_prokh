require 'logger'
require 'singleton'

class Lanbilling
  include Singleton

  attr_reader :logger, :timeout

  def initialize(opts = {})
    @logger = opts[:logger]
    @logger ||= defined?(Rails) ? Rails.logger : Logger.new(STDOUT)
    @timeout = opts[:timeout] || 20

    @ip = Settings.lanbilling.ip
    @admin_login = Settings.lanbilling.login
    @admin_pass = Settings.lanbilling.pass
    @wsdl_url = "http://#{@ip}:34012/?wsdl"

    admin_login
  end

  def accounts_by_agrm(number)
    execute(:get_accounts, flt: { agrmnum: number })
  end

  def agreements_by_agrm(number)
    execute(:get_agreements, flt: { agrmnum: number })
  end

  def get_recommended_payment(agrm_id)
    execute(:get_recommended_payment, id: agrm_id)
  end

  def del_usbox_service(id)
    execute(:del_usbox_service, id: id, notusbox: 1)
  end

  # def get_tariffs
  #   execute(:get_tarifs)
  # end

  # def get_account(id)
  #   execute(:get_account, id: id)
  # end

  # def get_agreement(uid)
  #   execute(:get_agreements, flt: { userid: uid })
  # end

  # def get_agreements()
  #   execute(:get_agreements, flt: { userid: uid })
  # end

  # def get_buildings(query = {})
  #   params = { flt: { city: 3994 }.merge(query) }
  #   execute(:get_address_buildings, params)
  # end

  # def get_building(id)
  #   params = { flt: { recordid: id } }
  #   execute(:get_address_buildings, params)
  # end

  # def get_streets
  #   params = { flt: { city: 3994 } }
  #   execute(:get_address_streets, params)
  # end

  # def get_street(id)
  #   params = { flt: { recordid: id } }
  #   execute(:get_address_streets, params)
  # end

  # def get_vgroups(id)
  #   params = { flt: { userid: id } }
  #   execute(:get_vgroups, params)
  # end

  # def get_vgroup(id)
  #   execute(:get_vgroup, id: id)
  # end

  # def address_code(address_params)
  #   params = {
  #     country: "Россия",
  #     region:  "Московская",
  #     city:    "Дубна",
  #     add: 0
  #   }.merge(address_params)
  #   execute(:get_address_indexes, params)
  # end

  # def insert_update_account(params)
  #   execute(:insupd_account, { val: params })
  # end

  # def insupd_vgroup(params)
  #   execute(:insupd_vgroup, { val: params })
  # end

  def get_payment(id)
    execute(:get_payments, { flt: { recordid: id } })
  end

  def payment(params)
    if Rails.env.development?
      raise "Cannot use in development"
    end
    execute(:payment, { val: params })
  end

  def delete_payment(id)
    q = get_payment(id)[:pay]
    Rails.logger.warn "Delete payment ID: #{id}, Amount: #{q[:amount]}"
    q[:amount] = 0
    self.payment(q)
  end

  # def insblk_rasp(params)
  #   execute(:ins_blk_rasp, { val: params })
  # end

  def admin_login
    login(:login, message: { login: @admin_login, pass: @admin_pass })
  end

  # def client_login(login, password)
  #   login(:client_login, message: { login: login, pass: password })
  # end

  def login(*auth_params)
    logger.warn "Try login to lanbilling" #.yellow
    @auth_params = auth_params if auth_params.present?
    response = client.call(*@auth_params)
    @auth_cookies = response.http.cookies
  end

  def logout
    execute(:logout)
    @auth_cookies = nil
  end

  def to_s
    inspect
  end

  def inspect
    "Lanbilling(ip: #{@ip}, object_id: #{"0x00%x" % (object_id << 1)})"
  end

  def execute(method, params = {})
    response = client_call(method, message: params, cookies: @auth_cookies)
    r = response.body[:"#{method}_response"]
    r && r[:ret]
  end

  private

    def client(force = false)
      @@client ||= Savon.client(wsdl: @wsdl_url, endpoint: "http://#{@ip}:34012/", read_timeout: timeout, open_timeout: timeout)
    end

    def client_call(*args)
      max_retries = 10
      times_retried = 0

      begin
        client.call(*args)
      rescue Net::ReadTimeout => error
        if times_retried < max_retries
          times_retried += 1
          logger.warn "Timeout while calling #{args[0]}, retry #{times_retried}/#{max_retries}"
          sleep 1
          retry
        else
          raise error
        end
      rescue Savon::SOAPFault => error
        detail = error.to_hash[:fault][:detail]
        if detail == 'Manager not authorized' && times_retried < max_retries
          login
          args[1][:cookies] = @auth_cookies
          times_retried += 1
          logger.warn "Retry auth when call #{args[0]}, retry #{times_retried}/#{max_retries}"
          sleep 1
          retry
        end
        logger.error "[LANBILLING_SERVICE] #{error.message}, detail: #{detail}, auth_params: #{@auth_params}, cookies: #{@auth_cookies}, args: #{args}"
        raise error
      rescue => error
        logger.error "[LANBILLING_SERVICE] #{error.class} - #{error.message}, auth_params: #{@auth_params}, cookies: #{@auth_cookies}, args: #{args}"
        raise error
      end

    end

    def decode_string(str)
      str.is_a?(String) ? str.force_encoding('windows-1251').encode('utf-8') : str
    end
end
