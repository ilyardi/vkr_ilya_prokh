class Dogovor < ApplicationRecord
    belongs_to :abonent
    belongs_to :lb_agreement, foreign_key: :agrm_id

    validates :street, :building, presence: true
    validates :flat, presence: true, unless: :confirmed?

    scope :confirmed, -> { where(confirmed: true) }
    scope :default, -> { where('default' => true) }
    scope :not_blocked, -> { where('blocked_at IS NULL') }

    delegate :services, :fee, :number, :balance, :lb_account, to: :lb_agreement
    delegate :name, to: :lb_account

    before_destroy :destroy_auto_payments

    def blocked?
        self.blocked_at.present?
    end

    def destroy_auto_payments
        auto_payments = AutoPaymentMethod.where(abonent_id: self.abonent_id, agrm_id: self.agrm_id).destroy_all
    end
end
