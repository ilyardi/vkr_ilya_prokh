class LbEventlog < LbBase
  self.primary_key = :record_id
  self.table_name = :eventlog
  self.inheritance_column = :inheritance_type

  belongs_to :lb_manager, foreign_key: "person_id"
end
