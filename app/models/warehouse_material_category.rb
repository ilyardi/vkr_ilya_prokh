class WarehouseMaterialCategory < ApplicationRecord
    has_many :warehouse_materials

    validates :name, uniqueness: true
end
