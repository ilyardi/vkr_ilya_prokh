class CreateExpensePurposes < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_purposes do |t|
      t.string :name, null: false
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
