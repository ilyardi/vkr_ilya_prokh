class AddCoordsToEquipmentLocations < ActiveRecord::Migration[6.1]
  def change
    add_column :equipment_locations, :coords, :jsonb, default: {}
  end
end
