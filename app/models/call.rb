class Call < ApplicationRecord
  validates :lb_manager_id, presence: true
  validates :lb_account_id, presence: true
  validates :call_reason_id, presence: true

  belongs_to :lb_manager
  belongs_to :lb_account
  belongs_to :call_reason

  scope :ordered, -> { order('created_at DESC') }
  scope :created_at, -> (dates) {
    if dates.is_a?(Array) && dates.size == 2 && dates[0].present? && dates[1].present?
      from = Time.parse(dates[0]).beginning_of_day
      to = Time.parse(dates[1]).end_of_day
      where("created_at BETWEEN ? AND ?", from, to)
    else
      all
    end
  }
end
