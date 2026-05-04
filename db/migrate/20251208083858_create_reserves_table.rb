class CreateReservesTable < ActiveRecord::Migration[6.1]
  def change
    create_table :reserves do |t|
      t.integer   :agrm_id, null: false
      t.date      :date, null: false
      t.decimal   :amount, default: 0
      t.decimal   :balance, default: 0
      t.timestamps
    end
  end
end
