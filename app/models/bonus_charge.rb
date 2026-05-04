class BonusCharge < ApplicationRecord
  belongs_to :lk_payment
  belongs_to :lb_payment

  after_create :update_bonus
  after_commit :send_push

  private

    def update_bonus
      bonus = Bonus.find_or_initialize_by(agrm_id: agrm_id) do |b|
        b.amount = 0
      end
      bonus.amount += self.amount
      bonus.save!
    end

    def send_push
      users = Abonent.joins(:dogovors).where(dogovors: {confirmed: true, agrm_id: self.agrm_id})
      users.each do |u|
        if self.lk_payment_id.nil?
          Notification.create_bonus_correction(u, self).async_send
        elsif self.amount > 0
          Notification.create_bonus(u, self).async_send
        elsif self.amount < 0
          Notification.create_spend_bonus(u, self).async_send
        end
      end
    end
end
