class LbBalance < LbBase
  self.primary_key = :agrm_id, :date
  self.table_name = :balances

  belongs_to :lb_agreement, foreign_key: :agrm_id
end
