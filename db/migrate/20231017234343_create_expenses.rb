class CreateExpenses < ActiveRecord::Migration[6.1]
  def change
    create_table :expenses do |t|
      t.string      :name, null: false
      t.string      :description
      t.string      :comment
      t.integer     :amount, default: 0
      t.references  :author, foreign_key: { to_table: :users }
      t.references  :expense_type, null: false
      t.references  :expense_stage, null: false
      t.timestamps
    end
  end
end
