class CreatePayments < ActiveRecord::Migration[5.2]
  def change
    create_table :payments do |t|
      t.string  :source_id
      t.string  :source_type
      t.string  :source_address
      t.string  :account_number, null: false
      t.decimal :amount
      t.date    :paid_at, index: true
      t.date    :added_at, index: true

      t.integer :status, default: 0, index: true
      t.integer :lanbilling_id
      t.string  :lanbilling_error
      t.json    :data
      t.timestamps
    end

    add_index :payments, [:source_id, :source_type], unique: true
  end
end
