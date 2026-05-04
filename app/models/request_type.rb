class RequestType < ApplicationRecord
	validates :name, presence: true
	validates :alert_timer, numericality: { only_integer: true , allow_nil: true}
	has_many :request_statuses
	has_many :request_subtypes
	has_many :request_first_reasons
	has_many :request_reasons
	has_many :requests
	scope :active,  -> { where(active: true) }
end
