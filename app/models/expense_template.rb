class ExpenseTemplate < ApplicationRecord
  validates :quantity, :unit, :expense_id, :expense_date, presence: true

  belongs_to :expense

  def generate_expense
    template = self.expense
    next_date = self.expense_date
    case self.unit
    when 'month'
      next_date += self.quantity.month
    when 'day'
      next_date += self.quantity.day
    end
    expense = Expense.create(
      name: template.name,
      expense_type_id: template.expense_type_id,
      expense_stage_id: template.expense_type.expense_stages.order(priority: :asc).first&.id,
      author_id: template.author_id,
      pay_type: template.pay_type,
      description: template.description,
      amount: template.amount,
      counterparty: template.counterparty,
      flow_rate: template.flow_rate,
      plan_date_payment: self.expense_date,
      repeatable: template.repeatable,
      expense_company_id: template.expense_company_id,
      expense_purpose_id: template.expense_purpose_id,
    )
    self.expense_id = expense.id
    self.expense_date = next_date
    self.save
    self
  end
end
