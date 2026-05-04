class CreateExpenseCounterparties < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_counterparties do |t|
      t.string :name, null: false
      t.string :inn, null: false
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
