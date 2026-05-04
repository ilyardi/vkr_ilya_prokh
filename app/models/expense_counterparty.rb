class ExpenseCounterparty < ApplicationRecord
  validates :name,:inn, presence: true
  validates :inn, uniqueness: true

  has_many :expenses

  scope :active,  -> { where(active: true) }
end
