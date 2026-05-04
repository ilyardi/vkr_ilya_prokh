class CreateEquipment < ActiveRecord::Migration[5.2]
  def change
    create_table :equipment do |t|
      t.string :identifier
      t.string :model
      t.string :brand
      t.string :serial_number
      t.references :equipment_type, foreign_key: true
      t.timestamps
    end
  end
end
