class Warehouse < ApplicationRecord
  has_many :equipment_locations, as: :location
end
