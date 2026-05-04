class Reserve < ApplicationRecord
  has_many :reserve_spends, dependent: :destroy
end
