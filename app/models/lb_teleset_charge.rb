class LbTelesetCharge < LbBase
  self.table_name = :teleset_charges

  belongs_to :lb_agreement, foreign_key: :agrm_id
end
