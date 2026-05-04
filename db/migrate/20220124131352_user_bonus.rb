class UserBonus < ActiveRecord::Migration[5.0]
  def change
    add_column :abonents, :bonus_rate, :integer, default: 10
    add_column :lk_payments, :abonent_id, :integer
    create_table :lk_payment_users do |t|
      t.integer :abonent_id
      t.integer :lk_payment_id
      t.timestamps
    end
  end
end
