class LbVgroup < LbBase
  self.primary_key = :vg_id
  self.table_name = :vgroups
  self.ignored_columns = [:changed]
  belongs_to :lb_tarif, foreign_key: :tar_id

  scope :blocked, -> (v) { where(blocked: v) }
end
