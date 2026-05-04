class TeledomBase < ActiveRecord::Base
  self.abstract_class = true
  establish_connection :teledom_prod
end
