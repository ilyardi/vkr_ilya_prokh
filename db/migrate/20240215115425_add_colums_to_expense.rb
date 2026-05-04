class AddColumsToExpense < ActiveRecord::Migration[6.1]
  def change
    add_reference :expenses, :expense_company, foreign_key: true

    add_column :expenses, :status, :string, null: false, default: "at_work"
    add_column :expenses, :repeatable, :boolean, default: false
  end
end
