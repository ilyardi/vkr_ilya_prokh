class PagePart < ApplicationRecord
  scope :ordered, -> { order('name') }

  validates :name, uniqueness: true
end
