class LbAddressFlat < LbBase
  self.table_name = 'address_flat'
  self.primary_key = :record_id
  has_many :lb_accounts_addrs, foreign_key: :flat

  scope :by_building, ->(s) { where(address_flat: { building: s }) }
end
