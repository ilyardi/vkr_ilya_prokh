class CreateReserveSpendesTable < ActiveRecord::Migration[6.1]
  def change
    create_table :reserve_spends do |t|
      t.integer   :reserve_id, null: false
      t.integer   :saldo_id, null: false
      t.date      :fee_date, null: false
      t.decimal   :amount, default: 0
      t.string    :operation_type, default: "spend"
      t.timestamps
    end
  end
end
