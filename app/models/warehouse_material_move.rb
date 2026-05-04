class WarehouseMaterialMove < ApplicationRecord
    enum operation_type: {:out => -1, :in => 1}

    belongs_to :user
    belongs_to :created_by, class_name: "User"
    belongs_to :warehouse_material

    validates :quantity, numericality: { greater_than: 0 }
    validates :user_id, presence: true

    after_save :update_material

    def update_material
        return if warehouse_material.nil?
        begin
            prefix = (operation_type == "out") ? -1 : 1
            update_quantity = quantity * prefix
            WarehouseMaterial.connection.execute("UPDATE warehouse_materials SET quantity = quantity + (#{update_quantity}) WHERE id = #{warehouse_material_id}")
        rescue => e
            puts e.message
            errors.add(:quantity, :not_enough, message: "not_enough")
            raise ActiveRecord::Rollback
        end
    end
end
