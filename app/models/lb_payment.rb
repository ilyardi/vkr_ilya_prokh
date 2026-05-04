# Статус платежа: 0-платеж проведен, 1-проведен и подтвержден сверкой (при загрузке файла сверки), 2-платеж аннулирован

class LbPayment < LbBase
  BONUS_CLASS_ID = 16
  PROMISED_CLASS_ID = 9

  self.primary_key = :record_id
  self.table_name = :payments

  enum teleset_service_type: { internet: 'internet' , tv: 'tv', video: 'video' }

  attribute :status, ActiveRecord::Type::Integer.new

  belongs_to :lb_class, foreign_key: :class_id
  belongs_to :lb_agreement, foreign_key: :agrm_id

  scope :confirmed, -> { where(status: 0) }
  scope :lb_class, -> (id) { where(class_id: id) }
  scope :promised, -> () { where(class_id: PROMISED_CLASS_ID) }
  scope :last_promised, -> () { promised.pay_date([Time.now-1.month, Time.now]) }

  scope :group_by_class, -> {
    select("agrm_id, sum(amount) as amount, GROUP_CONCAT(teleset_service_type) as service_types,
    CASE
      WHEN class_id = 16 THEN 'bonus'
      WHEN class_id = 12 THEN 'bonus'
      WHEN class_id = 4 THEN 'correction_tv'
      WHEN class_id = 17 THEN 'correction_internet'
      WHEN class_id = 18 THEN 'correction_video'
      WHEN class_id = 5 THEN 'correction_tv'
      WHEN class_id = 19 THEN 'correction_internet'
      WHEN class_id = 20 THEN 'correction_video'
      ELSE 'accounting'
    END AS class_name
    ").group('agrm_id, class_name').where('class_id NOT IN (?)', [9])
   }
  scope :account_type, -> (t) {
    includes(lb_agreement: :lb_account).where(accounts: { type: t })
  }

# bonus, возвраты, коррекировки

  scope :buh_date, -> (date) { where(buh_date: date) }
  scope :buh_dates, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = dates[0]
      from = Time.parse(from).beginning_of_day if from.is_a?(String)
      from = from.to_time.beginning_of_day if from.is_a?(Date)

      to = dates[1]
      to = Time.parse(to).end_of_day if to.is_a?(String)
      to = to.to_time.beginning_of_day if to.is_a?(Date)

      where("buh_date BETWEEN ? AND ?", from, to)
    else
      none
    end
  }
  scope :pay_date, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = dates[0]
      from = Time.parse(from).beginning_of_day if from.is_a?(String)
      from = from.to_time.beginning_of_day if from.is_a?(Date)

      to = dates[1]
      to = Time.parse(to).end_of_day if to.is_a?(String)
      to = to.to_time.beginning_of_day if to.is_a?(Date)

      where("pay_date BETWEEN ? AND ?", from, to)
    else
      none
    end
  }

  scope :local_date, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = dates[0]
      from = Time.parse(from).beginning_of_day if from.is_a?(String)
      from = from.to_time.beginning_of_day if from.is_a?(Date)

      to = dates[1]
      to = Time.parse(to).end_of_day if to.is_a?(String)
      to = to.to_time.beginning_of_day if to.is_a?(Date)

      where("local_date BETWEEN ? AND ?", from, to)
    else
      none
    end
  }

  def comment_for_user
    (self.class_id == BONUS_CLASS_ID) ? "оплата бонусами" : ""
  end

  class << self
    def create_promised(agrm_id:, amount:)
      return unless Rails.env.production?

      last_payment = self.where(agrm_id: agrm_id).last_promised.first
      if last_payment.present?
        return last_payment
      end

      invoice_number = "#{Time.now.strftime("%Y-%m-%d_%H-%M")}_#{rand(99_000).to_s.rjust(5, '0')}"

      l = Lanbilling.instance
      l.admin_login
      begin
        pay_id = l.payment(
          receipt: invoice_number,
          agrmid: agrm_id,
          amount: amount.to_f.abs,
          comment: "Личный кабинет",
          perioddate: Time.now.strftime('%Y-%m-%d'),
          classid: PROMISED_CLASS_ID
        )
        Rails.logger.warn "[DEBUG LB_PAYMENT] async_ports_up: #{agrm_id}"
        PortsUpJob.set(wait: 10.seconds).perform_later(agrm_id)
        return self.find_by(record_id: pay_id)
      rescue => e
        ExceptionNotifier.notify_exception(e, data: { agrm_id: agrm_id })
        return nil
      end
    end
  end
end
