class ExpenseType < ApplicationRecord
  validates :name, presence: true

  has_many :expense_stages
  has_many :expense_purposes

  scope :active,  -> { where(active: true) }
end
