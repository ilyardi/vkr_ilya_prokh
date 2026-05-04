class AddDeletedAtToEquipmentLocations < ActiveRecord::Migration[5.2]
  def change
    add_column :equipment_locations, :deleted_at, :timestamp
  end
end
