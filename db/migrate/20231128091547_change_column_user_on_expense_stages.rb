class ChangeColumnUserOnExpenseStages < ActiveRecord::Migration[6.1]
  def change
    remove_reference :expense_stages, :user
    add_reference :expense_stages, :user, foreign_key: true
    add_column :expenses, :pay_type, :string, default: "noncash"
    add_column :expenses, :counterparty, :string
    add_column :expenses, :date_payment,:datetime
    add_column :expenses, :plan_date_payment,:datetime
    change_column :expenses, :amount, :float, default: 0
  end
end
