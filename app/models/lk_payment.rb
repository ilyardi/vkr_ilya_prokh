class LkPayment < ApplicationRecord
  ProviderSberbankSbp = 'sberbank_sbp'
  ProviderSberbank = 'sberbank'
  ProviderMinbank  = 'minbank'
  ProviderYookassa  = 'yookassa'
  ProviderYookassaSbp  = 'yookassa_sbp'

  enum status:     { empty:     0, created:     1, paid:     2, canceled: 3, declined: 4, error: 5 }
  enum ofd_status: { ofd_empty: 0, ofd_created: 1, ofd_done: 2, ofd_error: 3 }
  enum lb_status:  { lb_empty:  0, lb_created:  1, lb_done:  2, lb_error: 3 }
  enum provider:   {
    yookassa:  'yookassa',
    yookassa_sbp: 'yookassa_sbp',
    sberbank_sbp:  'sberbank_sbp',
    sberbank:  'sberbank',
    minbank:  'minbank'
  }

  store_accessor :response,     :pay_errors, :pay_message
  store_accessor :ofd_response, :ofd_errors, :ofd_message
  store_accessor :lb_response,  :lb_errors,  :lb_payment_id

  validates :customer_name, :customer_email, presence: true
  validates :customer_email, email: {mode: :strict}

  before_create do
    self.invoice_number ||= generate_invoice_number
  end

  after_save :async_send_to_ofd, if: :saved_change_to_status?
  after_save :async_send_to_lb, if: :saved_change_to_status?
  after_save :async_bonus, if: :saved_change_to_status?
  after_save :async_ports_up, if: :saved_change_to_lb_status?

  belongs_to :lb_agreement, foreign_key: :agrm_id
  belongs_to :abonent
  belongs_to :auto_payment_method
  has_many   :lk_payment_users

  scope :search_by_created_at, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = Time.parse(dates[0]).beginning_of_day
      to = Time.parse(dates[1]).end_of_day
      where("created_at BETWEEN ? AND ?", from, to)
    elsif dates.present?
      from = Time.parse(dates).beginning_of_day
      to = Time.parse(dates).end_of_day
      where("created_at BETWEEN ? AND ?", from, to)
    else
      all
    end
  }

  def dogovor
    LbAgreement.find_by(agrm_id: self.agrm_id).try(:number)
  end

  def generate_invoice_number
    loop do
      number = "#{Time.now.strftime("%Y-%m-%d_%H-%M")}_#{rand(99_000).to_s.rjust(5, '0')}"
      return number unless LkPayment.exists?(invoice_number: number)
    end
  end

  def paid_date
    Time.parse(Hashie::Mash[self.response].pay_message.date) rescue nil
  end

  def async_bonus
    return unless paid?
    Rails.logger.warn "[DEBUG LK_PAYMENT] async_bonus: #{self.to_json}"
    AddBonusJob.set(wait: 1.seconds).perform_later(self.id)
  end

  def async_send_to_ofd
    return if ['yookassa', 'yookassa_sbp'].include?(self.provider)
    return unless paid?
    Rails.logger.warn "[DEBUG LK_PAYMENT] async_send_to_ofd: #{self.to_json}"
    if ofd_empty? || ofd_created?
      SendLkPaymentToOfdJob.set(wait: 10.seconds).perform_later(self.id)
    end
  end

  def async_send_to_lb
    return unless paid?
    Rails.logger.warn "[DEBUG LK_PAYMENT] async_send_to_lb: #{self.to_json}"
    if lb_empty? || lb_created?
      SendLbPhoneEmailJob.set(wait: 10.seconds).perform_later(agrm_id: self.agrm_id, email: self.customer_email, phone: self.customer_phone)
      SendLbPaymentJob.set(wait: 10.seconds).perform_later(self.id)
    end
  end

  def async_ports_up
    return unless lb_done?
    Rails.logger.warn "[DEBUG LK_PAYMENT] async_ports_up: #{self.to_json}"
    PortsUpJob.set(wait: 30.seconds).perform_later(self.agrm_id)
  end

  def send_to_ofd
    return unless Rails.env.production?
    return unless paid?
    return if ofd_done?

    orange = Ofd::OrangeData.new(self).perform
    if orange.success?
      self.ofd_message = orange.result
      self.ofd_done!
    else
      e = RuntimeError.new("Payment#send_to_ofd error")
      ExceptionNotifier.notify_exception(e, data: { payment: self.as_json, error: orange.error })
      self.ofd_errors = orange.error
      self.ofd_error!
    end
  end

  def send_to_lanbilling
    return unless Rails.env.production?

    l = Lanbilling.instance
    l.admin_login
    begin
      pay_id = l.payment(
        receipt: self.invoice_number,
        agrmid: self.agrm_id,
        amount: self.amount,
        comment: (self.charge_bonus? ? "Личный кабинет" : "Сайт Телесеть"),
        perioddate: self.created_at.strftime('%Y-%m-%d'),
        classid: (case self.provider
          when 'sberbank' then 21
          when 'sberbank_sbp' then 23
          when 'yookassa_sbp' then 23
          when 'yookassa' then 24
          else 8
          end
        )
      )
      self.lb_payment_id = pay_id
      self.lb_done!
      self.clear_cache
    rescue => e
      ExceptionNotifier.notify_exception(e, data: { payment: self.as_json })
      self.lb_errors = e.message
      self.lb_error!
    end
  end

  def params_for_ofd
    {
      invoice_number:   self.invoice_number,
      description:      self.description,
      amount:           self.amount,
      customer_contact: self.customer_email,
    }
  end

  def minbank_status
    gateway = Merchants::Minbank.new
    gateway.order_status(order_id, session_id).OrderStatus
  end

  # acquiring status
  def e_status
    gateway = Merchants.get(provider).new
    res = gateway.order_status(order_id: order_id, order_number: invoice_number)

    # ostatus = res.data["orderStatus"]
    # status_map = {
    #   "0" => 'заказ зарегистрирован, но не оплачен',
    #   "1" => 'предавторизованная сумма удержана (для двухстадийных платежей)',
    #   "2" => 'проведена полная авторизация суммы заказа',
    #   "3" => 'авторизация отменена',
    #   "4" => 'по транзакции была проведена операция возврата',
    #   "5" => 'инициирована авторизация через сервер контроля доступа банка-эмитента',
    #   "6" => 'авторизация отклонена'
    # }
    # puts status_map[ostatus.to_s]
    res.data
  end

  def clear_cache
    cache_key = "agrm_info_#{self.agrm_id}"
    Rails.cache.delete(cache_key)
  end

  def create_provider_order!
    gateway = Merchants.get(provider).new
    begin
      order_params = {
        client_id: self.abonent_id,
        order_number: self.id,
        email:  self.customer_email,
        phone:  self.customer_phone,
        amount: self.amount,
        description: self.description,
        order_create_date: Time.now,
        save_payment_method: false,
        payment_method_id: self.auto_payment_method&.pay_token.presence
      }

      result = gateway.create_order(order_params)

      if result.success?
        self.order_id = result.order_id
        if self.minbank?
          self.session_id = result.Order.SessionID
        end

        self.created!
        return if self.auto_payment_method_id.present?

        return { redirect_url: result.payment_url }
      end

      return { error: "Оплата временно не работает. Попробуйте позже."}
    rescue => e
      err = result.try(:error_message) rescue e.message
      Rails.logger.error "create_provider_order!: error: #{err}"
      self.pay_errors = { message: err, result: result.try(:data)}
      self.error!
      ExceptionNotifier.notify_exception(e, data: { payment: self.as_json, result: result.try(:data), error: e.message })
      return { error: "Оплата временно не работает. Попробуйте позже."}
    end
  end

  def try_auto_pay!
    if binding_id = self.auto_payment_method&.pay_token.presence
      gateway = Merchants.get(provider).new
      gateway.payment_order_binding(order_id: self.order_id, binding_id: binding_id)
    end
  end

  def check_provider_order
    return self unless self.created?

    gateway = Merchants.get(provider).new
    if self.minbank?
      result = gateway.order_status(self.order_id, self.session_id)
      self.pay_message = result.data

      case result.OrderStatus
      when Merchants::Minbank::ORDER_STATUS_APPROVED
        self.paid!
      when Merchants::Minbank::ORDER_STATUS_CANCELED
        self.canceled!
      when Merchants::Minbank::ORDER_STATUS_DECLINED
        self.declined!
      end
    elsif self.sberbank?
      result = gateway.order_status(order_id: self.order_id)
      self.pay_message = result.data

      if result.success?
        case result.order_status
        when Merchants::Sberbank::ORDER_STATUS_APPROVED
          self.paid!
        when Merchants::Sberbank::ORDER_STATUS_CANCELED
          self.canceled!
        when Merchants::Sberbank::ORDER_STATUS_DECLINED
          self.declined!
        end
      end
    elsif self.yookassa?
      result = gateway.order_status(self.order_id)
      self.pay_message = result.data

      if result.success?
        case result.order_status
        when Merchants::Yookassa::ORDER_STATUS_APPROVED
          self.paid!
        when Merchants::Yookassa::ORDER_STATUS_CANCELED
          self.canceled!
        end
      end
    elsif self.yookassa_sbp?
      result = gateway.order_status(self.order_id)
      self.pay_message = result.data

      if result.success?
        case result.order_status
        when Merchants::YookassaSBP::ORDER_STATUS_APPROVED
          self.paid!
        when Merchants::YookassaSBP::ORDER_STATUS_CANCELED
          self.canceled!
        end
      end
    elsif self.sberbank_sbp?
      result = gateway.order_status(order_id: self.order_id, order_number: self.invoice_number)
      self.pay_message = result.data

      if result.success?
        if result.paid?
          self.paid!
        elsif result.cancelled?
          self.canceled!
        elsif result.declined?
          self.declined!
        end
      end
    end

    return self
  end
end

class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
      record.errors.add attribute, (options[:message] || "is not an email")
    end
  end
end
