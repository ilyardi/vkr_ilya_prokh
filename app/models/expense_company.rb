class ExpenseCompany < ApplicationRecord
  validates :name, presence: true

  has_many :expenses

  scope :active,  -> { where(active: true) }
end
