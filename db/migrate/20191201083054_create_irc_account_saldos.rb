class CreateIrcAccountSaldos < ActiveRecord::Migration[5.2]
  def change
    create_table :irc_account_saldos do |t|
      t.string  :agrm_number, unique: true
      t.decimal :fee
      t.decimal :saldo
      t.date    :date
      t.string  :address
      t.jsonb  :details, default: {}
      t.integer :agrm_id
      t.decimal :billing_fee
      t.decimal :billing_saldo
      t.decimal :billing_address
      t.timestamps
    end
  end
end
