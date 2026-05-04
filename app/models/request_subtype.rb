class RequestSubtype < ApplicationRecord
	validates :name, presence: true
	belongs_to :request_type
end