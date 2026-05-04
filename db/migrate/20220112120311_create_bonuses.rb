class CreateBonuses < ActiveRecord::Migration[6.1]
  def change
    create_table :bonuses do |t|
      t.integer :agrm_id
      t.decimal :amount
      t.timestamps
    end
    add_index :bonuses, :agrm_id, unique: true
  end
end
