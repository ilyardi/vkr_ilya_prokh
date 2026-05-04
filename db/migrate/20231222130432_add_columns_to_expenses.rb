class AddColumnsToExpenses < ActiveRecord::Migration[6.1]
  def change
    add_reference :expenses, :expense_purpose, foreign_key: true
    add_column :expenses, :flow_rate, :string, default: 'opex'
  end
end
