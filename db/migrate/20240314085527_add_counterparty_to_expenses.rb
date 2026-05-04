class AddCounterpartyToExpenses < ActiveRecord::Migration[6.1]
  def change
    add_reference :expenses, :expense_counterparty, foreign_key: true
    add_reference :expense_purposes, :expense_type, foreign_key: true
  end
end
