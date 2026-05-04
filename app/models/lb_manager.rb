class LbManager < LbBase
  self.primary_key = :person_id
  self.table_name = :managers

  has_many :calls
end
