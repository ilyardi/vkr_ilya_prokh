class ValidatePayerDataEmail < ActiveModel::Validator
  def validate(record)
    unless record.payer_data["email"].present?
      record.errors.add :email, 'Email не может быть пустым'
      return
    end
    unless record.payer_data["email"] =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
      record.errors.add :email, "Не корректный email"
    end
  end
end

class AutoPaymentMethod < ApplicationRecord
  acts_as_paranoid

  enum status: { created: 'created', confirmed: 'confirmed', done: 'done', declined: 'declined' }
  enum service: { sberbank: 'sberbank', yookassa: 'yookassa' }

  scope :active, -> {where(active: true)}
  scope :available, -> { done.or(confirmed) }

  validates :abonent_id, :agrm_id, :amount, :date, presence: true
  validates :amount, numericality: { greater_than: 0 }
  validates_with ValidatePayerDataEmail

  before_destroy :clear_secure
  before_save ->(apm) {
    if apm.active_changed? && apm.active?
      current_payment = AutoPaymentMethod.find_by(active: true, abonent_id: apm.abonent_id, agrm_id: apm.agrm_id)
      current_payment&.destroy
    end
  }

  belongs_to :abonent
  belongs_to :lb_agreement, foreign_key: :agrm_id
  belongs_to :agreement, foreign_key: :agrm_id, primary_key: :external_id
  has_many :lk_payments

  def create_initial_order!
    merchant = Merchants::Yookassa.new
    begin
      order_number = "auto_payment_#{self.id}"
      unless Rails.env.production?
        order_number += "_#{Time.now.to_i}"
      end
      init_payment = merchant.create_auto_order(
        client_id: self.abonent_id,
        order_number: order_number,
        amount: 1,
        email: self.payer_data["email"],
        phone: self.payer_data["phone"],
        description: 'Регистрация автоплатежа'
      )
      if init_payment.success?
        self.update(
          merchant_order_id: init_payment.order_id,
        )
        return { redirect_url: init_payment.payment_url }
      end

      raise "Error Auto Payment Method#create_order"
    rescue => e
      Rails.logger.error e
      err = init_payment.try(:error_message) rescue e.message
      ExceptionNotifier.notify_exception(e, data: { payment: self.as_json, result: init_payment.try(:data), error: e.message })
      return { error: "Регистрация автоплатежа временно не работает. Попробуйте позже."}
    end
  end

  def check_initial_order
    merchant = Merchants::Yookassa.new
    init_status = merchant.order_status(self.merchant_order_id)

    if init_status.success?
      case init_status.order_status
      when Merchants::Yookassa::ORDER_STATUS_WAITING
        self.pay_token = init_status.data["payment_method"]["id"]
        case init_status.data["payment_method"]["type"]
        when 'bank_card'
          self.card = init_status.data["payment_method"]["card"]
        when 'yoo_money'
          self.card = {type: "yoo_money", account_number: "41001643160289"}
        else
          self.card = inti_status.data["payment_method"]
        end
        self.confirmed!
      when Merchants::Yookassa::ORDER_STATUS_CANCELED
        if self.confirmed?
          self.active = true
          self.done!
          return self
        end
        self.declined! if self.created?
      end
    end

    return self
  end

  def reverse_initial_order
    gateway = Merchants.get(self.service).new

    case self.service
    when 'yookassa'
      gateway.reverse(self.merchant_order_id)
      return
    when 'sberbank'
      merchant = Merchants::Sberbank.new
      merchant.reverse(order_id: self.merchant_order_id)

      result = merchant.order_status(order_id: self.merchant_order_id)
      if result.order_status == Merchants::Sberbank::ORDER_STATUS_CANCELED
        self.active = true
        self.done!
        return
      end
    end

    ex = RuntimeError.new('Errors in AutoPayment#reverse_initial_order')
    ExceptionNotifier.notify_exception(ex, data: { auto_payment_method: self.as_json, order_status: result.order_status })
  end

  def refund_initial_order
    merchant = Merchants::Yookassa.new
    result = merchant.refund(order_id: self.merchant_order_id, amount: 1)

    if result.success?
      self.active = true
      self.done!
      return
    end

    ex = RuntimeError.new('Errors in AutoPayment#refund_initial_order')
    ExceptionNotifier.notify_exception(ex, data: { auto_payment_method: self.as_json, order_status: result.status })
  end

  def clear_secure
    self.pay_token = nil
    self.active = false
    self.save
  end

  def pay!
    return unless self.done?

    address = Dogovor.find_by(agrm_id: self.agrm_id, abonent_id: self.abonent_id)
    payment = self.lk_payments.create(
      agrm_id:          self.agrm_id,
      amount:           self.amount,
      customer_name:    self.payer_data['name'],
      customer_email:   self.payer_data['email'],
      customer_phone:   self.payer_data['phone'],
      customer_address: self.payer_data['address'],
      description:      "Автоплатеж за услуги связи",
      charge_bonus:     (address && address.confirmed?),
      provider:         self.service,
      abonent:          self.abonent,
      source:           "auto_payment",
    )
    if payment.errors.size > 0
      puts "exception block"
      ex = RuntimeError.new('Errors in Payment#create')
      ExceptionNotifier.notify_exception(ex, data: { payment: payment, errors: payment.errors })
      return
    end
    self.date = self.date+1.month
    self.save
    payment.create_provider_order!
  end
end
