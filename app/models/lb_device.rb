class LbDevice < LbBase
    self.primary_key = :device_id
    self.table_name = :devices
    self.inheritance_column = :inheritance_type

    has_many :requests, :as => :resource

    belongs_to :lb_address_street, foreign_key: :street_id, primary_key: :record_id
    belongs_to :lb_address_building, foreign_key: :building_id, primary_key: :record_id
    belongs_to :lb_address_flat, foreign_key: :flat_id, primary_key: :record_id
    belongs_to :lb_address_entrance, foreign_key: :entrance_id, primary_key: :record_id

    def get_address
        address = ""
        street = self.lb_address_street
        building = self.lb_address_building
        entrance = self.lb_address_entrance
        address += "ул. #{street.name}" if street.present?
        address += ", д.#{building.name}" if building.present?
        address += ", п.#{entrance.name}" if entrance.present?
        address
    end
end