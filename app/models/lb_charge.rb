class LbCharge < LbBase
  self.primary_key = :record_id
  self.table_name = :charges

  belongs_to :lb_vgroup, foreign_key: :vg_id
end
