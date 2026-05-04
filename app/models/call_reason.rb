class CallReason < ApplicationRecord
  scope :ordered, -> { order('position ASC, id ASC') }
  scope :active, -> { where(active: true) }
end
