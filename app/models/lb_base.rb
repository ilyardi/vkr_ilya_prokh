class LbBase < ActiveRecord::Base
  self.abstract_class = true
  establish_connection :lanbilling_prod
end
