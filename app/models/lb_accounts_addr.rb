class LbAccountsAddr < LbBase
  self.table_name = 'accounts_addr'
  self.inheritance_column = :inheritance_type
  belongs_to :lb_account, foreign_key: :uid
  belongs_to :lb_address_street, foreign_key: :street, primary_key: :record_id
  belongs_to :lb_address_building, foreign_key: :building, primary_key: :record_id
  belongs_to :lb_address_entrance, foreign_key: :entrance, primary_key: :record_id
  belongs_to :lb_address_flat, foreign_key: :flat, primary_key: :record_id
  belongs_to :lb_address_floor, foreign_key: :floor, primary_key: :record_id

  scope :connection_type, -> { where(type: 2) }
end
