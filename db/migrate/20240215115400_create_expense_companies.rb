class CreateExpenseCompanies < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_companies do |t|
      t.string :name, null: false
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
