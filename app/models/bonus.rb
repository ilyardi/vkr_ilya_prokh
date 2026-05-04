class Bonus < ApplicationRecord
  has_many :charges, class_name: 'BonusCharge', foreign_key: :agrm_id,  primary_key: :agrm_id
  belongs_to :lb_agreement, foreign_key: :agrm_id

  def self.add_by_payment(payment)
    return unless payment.charge_bonus?

    return unless payment.lb_agreement.lb_account.individual?

    unless payment.paid?
      raise "Payment not paid"
    end

    bonus_rate = 0.02
    if payment.abonent != nil
      pu = LkPaymentUser.create(abonent_id: payment.abonent.id, lk_payment_id: payment.id)
      if pu.errors.size > 0
        Rails.logger.error("[Bonus#add_by_payment] Errors PaymentUser.create: #{pu.errors.to_json}")
      end
      bonus_rate = payment.abonent.bonus_rate / 100.0
    end

    Bonus.transaction do
      agrm_id = payment.agrm_id
      bonus_amount = payment.amount * bonus_rate

      BonusCharge.create!(agrm_id: agrm_id, amount: bonus_amount, lk_payment: payment)
    end

    # Если у абонента бонусы 10%, то пробуем его переключить на 15 процентов
    # if payment.abonent.bonus_rate == 5
    #   abonents = check_bonus_rate(payment.agrm_id)
    #   if abonents.detect{|a| a.id == payment.abonent_id }
    #     payment.abonent.update_columns(bonus_rate: 10, updated_at: Time.now)
    #   end
    # end

    if bonus = Bonus.find_by(agrm_id: payment.agrm_id)
      BonusWithdrawn.set(wait: 10.seconds).perform_later(bonus.id)
    end
  end

  def self.check_bonus_rate(agrm_id)
    # from = (Date.today - 12.month)
    # to = Date.today + 1.day

    # bonus_sum = BonusCharge.where(agrm_id: agrm_id).where('lk_payment_id IS NOT NULL AND amount > 0 AND created_at BETWEEN ? AND ?', from, to).sum(:amount) || 0
    # fee_sum = LbAgreement.find(agrm_id).fee_by_period(from, to) || 0

    # if bonus_sum*5 >= fee_sum
    #   abonents = Dogovor.where(confirmed: true, agrm_id: agrm_id).includes(:abonent).map(&:abonent)
    #   return abonents
    # end

    return []
  end

  def can_withdrawn?
    fee = lb_agreement.get_services[:fee]
    return (fee > 50 && self.amount >= fee)
  end

  def withdrawn!
    bonus_amount = lb_agreement.get_services[:fee]

    unless can_withdrawn?
      Rails.logger.warn "[Bonus#withdrawn!] cannot withdrawn: agrm_id: #{self.agrm_id}, fee: #{bonus_amount}, bonus: #{self.amount}"
      return
    end

    Rails.logger.warn "[Bonus#withdrawn!] agrm_id: #{self.agrm_id}, fee: #{bonus_amount}, bonus: #{self.amount}"

    Bonus.transaction do
      charge = BonusCharge.create!(agrm_id: agrm_id, amount: -bonus_amount)

      l = Lanbilling.instance
      l.admin_login
      begin
        payment_params = {
          receipt: "#{Time.now.strftime("%Y-%m-%d_%H-%M")}_#{rand(99_000).to_s.rjust(5, '0')}",
          agrmid: self.agrm_id,
          amount: bonus_amount,
          comment: "Оплата бонусами",
          perioddate: Date.today.strftime('%Y-%m-%d'),
          classid: LbPayment::BONUS_CLASS_ID,
        }
        pay_id = l.payment(payment_params)
        charge.update_column(:lb_payment_id, pay_id)
      rescue => e
        ExceptionNotifier.notify_exception(e, data: { bonus_amount: bonus_amount, payment_params: payment_params, bonus: self.as_json })
        raise ActiveRecord::Rollback
      end
    end
  end

  def self.move_bonus!(ag_number1, ag_number2)
    ag1 = LbAgreement.find_by(number: ag_number1)
    ag2 = LbAgreement.find_by(number: ag_number2)

    bonus = Bonus.find_by(agrm_id: ag1).amount

    puts "Current info:"
    puts ag1.lb_account.address_connect + " => " + ag2.lb_account.address_connect
    puts Bonus.find_by(agrm_id: ag1.agrm_id).amount.to_s + " => " + (Bonus.find_by(agrm_id: ag2.agrm_id).amount.to_s rescue 'nil')

    bc1 = BonusCharge.insert({agrm_id: ag1.agrm_id, amount: -1*bonus, created_at: Time.now, updated_at: Time.now})
    BonusCharge.find(bc1[0]["id"]).send(:update_bonus)


    bc2 = BonusCharge.insert({agrm_id: ag2.agrm_id, amount: bonus, created_at: Time.now, updated_at: Time.now})
    BonusCharge.find(bc2[0]["id"]).send(:update_bonus)

    puts "After move info:"
    puts Bonus.find_by(agrm_id: ag1.agrm_id).amount.to_s + " => " + (Bonus.find_by(agrm_id: ag2.agrm_id).amount.to_s rescue 'nil')
  end
end
