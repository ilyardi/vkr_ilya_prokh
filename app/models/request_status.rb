class RequestStatus < ApplicationRecord
    validates :name, presence: true
	validates :alert_timer, numericality: { only_integer: true , allow_nil: true}
    belongs_to :request_type

    scope :active, ->{where(active: true)}
end
