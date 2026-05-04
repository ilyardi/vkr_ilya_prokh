class CreateIrcPayments < ActiveRecord::Migration[5.2]
  def change
    create_table :irc_payments do |t|
      t.integer :irc_id, unique: true, index: true
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
  end
end
