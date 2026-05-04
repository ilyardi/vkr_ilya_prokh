class CreateExpenseStages < ActiveRecord::Migration[6.1]
  def change
    create_table :expense_stages do |t|
      t.string      :name, null: false
      t.integer     :alert_timer
      t.references  :expense_type, null: false
      t.references  :user, null: false
      t.boolean     :active, default: true
      t.integer     :priority
      t.timestamps
    end
  end
end
