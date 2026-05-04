class CreatePhoneConfirmations < ActiveRecord::Migration[6.1]
  def change
    create_table :phone_confirmations do |t|
      t.string :phone, null: false
      t.string :code, null: false
      t.integer :action, default: 1
      t.datetime :expire_at
      t.timestamps
    end
  end
end
