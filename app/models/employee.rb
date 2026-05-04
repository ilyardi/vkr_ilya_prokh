class Employee < ApplicationRecord
  has_many :equipment_locations, as: :locationable
end

