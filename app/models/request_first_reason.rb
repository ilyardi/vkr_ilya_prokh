class RequestFirstReason < ApplicationRecord
    scope :active,  -> { where(active: true) }
end