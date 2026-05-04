class CreateAbonents < ActiveRecord::Migration[6.1]
  def change
    create_table :abonents do |t|
      t.string  :phone, null: false, unique: true
      t.string  :email, default: ""
      t.boolean :unconfirmed_email, default: ""
      t.string  :confirmation_token
      t.timestamps
    end
  end
end
