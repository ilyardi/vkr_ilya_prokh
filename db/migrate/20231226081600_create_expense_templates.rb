class CreateExpenseTemplates < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_templates do |t|
      t.integer :quantity, null: false
      t.string :unit, null: false
      t.references :expense, foreign_key: true
      t.datetime :expense_date
      t.datetime :deleted_at
      t.timestamps
    end
  end
end
