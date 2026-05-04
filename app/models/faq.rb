class Faq < ApplicationRecord
  acts_as_nested_set
  validates :title, presence: true

  scope :ordered,     -> { order('lft') }
  scope :enabled,     -> { where(enabled: true) }

  def content?
    !content.strip.size.zero?
  end

end
