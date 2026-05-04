class LbAddressStreet < LbBase
  self.table_name = 'address_street'
  self.primary_key = :record_id
  has_many :lb_accounts_addrs, foreign_key: :street

  scope :by_city, ->(s) { where(address_street: { city: s }) }
  scope :by_name, ->(s) { where(address_street: { name: s }) }
  scope :like_name, ->(s) { where('address_street.name LIKE ?', s) }

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
