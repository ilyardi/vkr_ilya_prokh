class TeledomUser < TeledomBase
  self.primary_key = :house_subscriber_id
  self.table_name = :houses_subscribers_mobile
end
