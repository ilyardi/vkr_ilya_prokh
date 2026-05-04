class LbAddressEntrance < LbBase
    self.table_name = 'address_entrance'
    self.primary_key = :record_id

    scope :by_building, ->(s) { where(address_entrance: { building: s }) }
end