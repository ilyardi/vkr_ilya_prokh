# frozen_string_literal: true
#
# PORO-декоратор, имитирующий интерфейс LbAgreement (внешняя БД LanBilling)
# для демо-должников из дипломной презентации.
#
class DemoLbAgreement
  DEMO_AGRM_ID_THRESHOLD = 1_999_000_000

  attr_reader :agrm_id, :number, :balance, :uid, :id, :lk_status

  def self.demo?(agrm_id)
    agrm_id.to_i >= DEMO_AGRM_ID_THRESHOLD
  end

  def self.all(debtors_index = {})
    Agreement.where("external_id >= ?", DEMO_AGRM_ID_THRESHOLD).map do |a|
      new(a, debtors_index[a.external_id])
    end
  end

  def initialize(agreement, debtor = nil)
    @agrm_id   = agreement.external_id
    @id        = agreement.external_id
    @number    = agreement.number
    @balance   = debtor&.balance.to_i
    @uid       = "demo-#{agreement.id}"
    @lk_status = "no_lk"
    @account   = DemoLbAccount.new(@number, @agrm_id, @balance)
  end

  def lb_account
    @account
  end

  def lb_teleset_charges
    @charges ||= [DemoCharge.new((@balance.abs / 5).clamp(300, 1500), id: @agrm_id.to_i)]
  end

  def lb_payments
    []
  end

  def dogovors
    []
  end

  def get_tariffs
    [{ id: 0, descr: "Демо-тариф", fee: lb_teleset_charges.first&.fee }]
  end

  def bonus
    nil
  end

    class DemoCharge
        attr_reader :id, :fee, :month
        def initialize(fee, id: 1, month: Date.current.beginning_of_month)
        @id    = id
        @fee   = fee
        @month = month
        end
    end

  class DemoVgroupsRelation
    include Enumerable
    def initialize(items = []); @items = items; end
    def blocked(_state); self; end
    def each(&block); @items.each(&block); end
    def map(&block); @items.map(&block); end
    def size; @items.size; end
    def empty?; @items.empty?; end
  end

  class DemoCallsRelation
    include Enumerable
    def initialize(items = []); @items = items; end
    def order(*); self; end
    def each(&block); @items.each(&block); end
    def map(&block); @items.map(&block); end
    def size; @items.size; end
    def empty?; @items.empty?; end
  end

  class DemoLbAccount
    attr_reader :address_connect, :mobile, :phone, :fax, :name,
                :abonent_surname, :abonent_name, :abonent_patronymic,
                :type, :bill_delivery, :email, :descr, :archive,
                :login, :pass, :last_change_descr

    DEMO_STREETS = [
      "ул. Демонстрационная", "ул. Тестовая", "пр. Дипломный",
      "ул. Презентационная", "пер. Защитный", "ул. Сидовая"
    ].freeze

    DEMO_NAMES = [
      ["Иванов",   "Иван",    "Иванович"],
      ["Петров",   "Пётр",    "Петрович"],
      ["Сидоров",  "Сидор",   "Сидорович"],
      ["Кузнецов", "Алексей", "Михайлович"],
      ["Смирнова", "Анна",    "Сергеевна"],
      ["Орлов",    "Дмитрий", "Олегович"]
    ].freeze

    def initialize(number, agrm_id, balance = 0)
      idx_raw = number.to_s[/\d+\z/].to_i
      idx     = idx_raw.zero? ? agrm_id.to_i : idx_raw
      slot    = idx % DEMO_STREETS.size

      street               = DEMO_STREETS[slot]
      house                = (idx % 90) + 1
      flat                 = ((idx * 7) % 250) + 1
      surname, name, patro = DEMO_NAMES[slot]

      @address_connect    = "#{street}, д. #{house}, кв. #{flat}"
      @mobile             = format("+7 (900) %03d-%02d-00", idx % 1000, idx % 100)
      @phone              = nil
      @fax                = nil
      @abonent_surname    = surname
      @abonent_name       = name
      @abonent_patronymic = patro
      @name               = "#{surname} #{name} #{patro}"
      @type               = 1
      @bill_delivery      = 0
      @email              = "demo#{idx}@demo.local"
      @descr              = "Демо-абонент №#{idx}"
      @archive            = 0
      @balance            = balance
      @login              = "demo#{idx}"
      @pass               = "demo-pass-#{idx}"
      @last_change_descr  = "Демо-аккаунт, без реальных изменений в LanBilling"
    end

    def lb_vgroups
      @lb_vgroups ||= DemoVgroupsRelation.new
    end

    def calls
      @calls ||= DemoCallsRelation.new
    end
  end
end