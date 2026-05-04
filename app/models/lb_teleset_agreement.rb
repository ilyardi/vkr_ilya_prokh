class LbTelesetAgreement < LbBase
  self.primary_key = :agrm_id
  self.table_name = :teleset_agreements

  belongs_to :lb_agreement, foreign_key: :agrm_id
end
