class LbWebSession < LbBase
  self.primary_key = :session_id
  self.table_name = :json_web_sessions
end
