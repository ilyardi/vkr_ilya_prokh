class Payment < ApplicationRecord
  # minbank_ones - МИНбанк терминал самообслуживания (разовые платежи)
  SOURCE_TYPES = %w(irc sber rschet minbank_ones)

  enum status: { empty: 0, done: 1, cancelled: 2, unprocessable: 90, error: 99 }
  enum ofd_status: { ofd_empty: 0, ofd_done: 1, ofd_unprocessable: 90, ofd_error: 99 }

  store_accessor :data, :bankcod, :banknam, :ofd_errors, :ofd_message

  validates :source_type, inclusion: { in: SOURCE_TYPES }

  after_commit :async_send, on: [:create]

  scope :search_by_source_id, -> (v) { where(source_id: v) }
  scope :search_by_account_number, -> (v) { where(account_number: v) }
  scope :search_by_banknam, -> (v) { where(banknam: v) }
  scope :search_by_amount, -> (v) { where(amount: v) }

  scope :search_by_paid_at, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = Time.parse(dates[0]).beginning_of_day
      to = Time.parse(dates[1]).end_of_day
      where("paid_at BETWEEN ? AND ?", from, to)
    elsif dates.present?
      from = Time.parse(dates).beginning_of_day
      to = Time.parse(dates).end_of_day
      where("paid_at BETWEEN ? AND ?", from, to)
    else
      all
    end
  }

  def async_send
    SendToLanbillingJob.perform_later self.id
  end

  def async_send_to_ofd
    SendOfdJob.perform_later(self.id)
  end


  def send_to_lanbilling
    Payment.transaction do
      self.lock!

      return if done?

      begin
        pay_id = if Rails.env.production?
          Lanbilling.instance.payment(params_for_lanbilling)
        else
          rand(100)
        end
        self.lanbilling_id = pay_id
        self.lanbilling_error = nil
        self.done!

        async_send_to_ofd
      rescue => e
        Rails.logger.error "[Payment#send_to_lanbilling] #{e.class.name} - #{e.message}"
        Rails.logger.error e.backtrace.join("\n")

        if e.message.include?('Receipt $1 already used')
          self.lanbilling_error = e.message
          self.done!
        elsif e.message.include?('Agreement not found')
          self.lanbilling_error = e.message
          self.unprocessable!
        else
          ExceptionNotifier.notify_exception(e, data: { payment: self.as_json })
          self.lanbilling_error = e.message
          self.error!
        end
      end
    end
  end

  def send_to_ofd
    return unless Rails.env.production?
    return unless done?
    return if ofd_done? || ofd_unprocessable?
    unless %w/sber rschet minbank_ones/.include?(source_type)
      self.ofd_unprocessable!
      return
    end

    Payment.transaction do
      self.lock!

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
  end

  def params_for_lanbilling
    agrm_id = find_agrm_id
    perioddate = added_at

    case source_type
    when 'irc' then
      classid = 10
    when 'sber' then
      classid = 6
    when 'rschet' then
      classid = 7
    when 'minbank_ones' then
      classid = 13
    else
      raise "Not set classid for source_type=#{source_type}"
    end

    {
      receipt: "#{paid_at.strftime("%Y%m%d")}-#{source_id}",
      agrmid:  agrm_id,
      amount:  amount,
      comment: [I18n.t(source_type, scope: 'payments.source_types'), banknam.presence].compact.join(" "),
      paydate: paid_at.strftime("%Y-%m-%d 00:00:00"),
      perioddate: perioddate.strftime("%Y-%m-%d"),
      classid: classid,
    }
  end

  def params_for_delete
    agrm_id = find_agrm_id
    {
      recordid: lanbilling_id,
      receipt: "#{paid_at.strftime("%Y%m%d")}-#{source_id}",
      agrmid:  agrm_id,
      status:   2,
      comment:  "Отмена платежа #{lanbilling_id}",
    }
  end

  def params_for_ofd
    {
      invoice_number:   "#{paid_at.strftime("%Y%m%d")}-#{source_id}",
      description:      "Оплата за тариф",
      amount:           self.amount,
      customer_contact: "buh@teleset.plus",
    }
  end

  def find_agrm_id
    agrm = LbAgreement.find_by(number: self.account_number, archive: 0, state: 0)
    return agrm.agrm_id if agrm
    raise "Agreement not found"
  end

end
