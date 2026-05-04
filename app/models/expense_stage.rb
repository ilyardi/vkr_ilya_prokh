class ExpenseStage < ApplicationRecord
  validates :name, :expense_type_id, presence: true

  belongs_to :expense_type
  belongs_to :user

  scope :active,  -> { where(active: true) }

  def get_next_stage
    stage_group = ExpenseStage.where(expense_type_id: self.expense_type_id).active.order(priority: :asc)
    next_stage = stage_group.find{|stage| stage.priority > self.priority}
    next_stage
  end

  def get_prev_stage
    stage_group = ExpenseStage.where(expense_type_id: self.expense_type_id).active.order(priority: :asc)
    arr_of_stages = stage_group.pluck(:name)
    current_index = arr_of_stages.index(self.name)
    return nil unless current_index > 0
    stage_group[current_index-1]
  end
end
