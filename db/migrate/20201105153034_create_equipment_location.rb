class CreateEquipmentLocation < ActiveRecord::Migration[5.2]
  def change
    create_table :equipment_locations do |t|
      t.references :equipment, foreign_key: true
      t.references :location, polymorphic: true, index: { name: :index_type_and_location_id }
      t.string :status
      t.integer :changed_by
      t.timestamps
    end
  end
end
