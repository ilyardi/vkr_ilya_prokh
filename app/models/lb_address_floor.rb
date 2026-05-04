class LbAddressFloor < LbBase
    self.table_name = 'address_floor'
    self.primary_key = :record_id

    scope :by_building, ->(s) { where(address_floor: { building: s }) }
end