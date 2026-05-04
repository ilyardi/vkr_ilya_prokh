class CreateBonusCharges < ActiveRecord::Migration[6.1]
  def change
    create_table :bonus_charges do |t|
      t.integer :agrm_id
      t.integer :lb_payment_id
      t.integer :lk_payment_id
      t.decimal :amount
      t.timestamps
    end
    add_index :bonus_charges, :lk_payment_id, unique: true
  end
end
