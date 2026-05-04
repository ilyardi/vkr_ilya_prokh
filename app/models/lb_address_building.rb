class LbAddressBuilding < LbBase
  self.table_name = 'address_building'
  self.primary_key = :record_id
  has_many :lb_accounts_addrs, foreign_key: :building
  belongs_to :lb_address_street, foreign_key: :street

  scope :by_city,   ->(s) { where(address_building: { city: s }) }
  scope :by_street, ->(s) { where(address_building: { street: s }) }
  scope :by_name,   ->(s) { where(address_building: { name: s }) }
  scope :like_name, ->(s) { where('address_building.name LIKE ?', s) }

  def fullname
    "#{self.name}#{self.block.present? ? " корп. #{self.block}" : "" }"
  end

  def with_street_name
    "#{self.lb_address_street&.name}, #{self.name}"
  end

  def self.dubna(only_exists: true)
    s = self.by_city(3994).
      joins(lb_accounts_addrs: :lb_account).
      where(accounts: { archive: 0 })

    if only_exists
      s = s.where(accounts_addr: { type: 2 })
    end

    s.order('name ASC').distinct
  end
end
