json.equipment do
  json.(@equipment, :id, :identifier, :model, :brand, :serial_number, :created_at, :comment, :equipment_type_id)
  json.location_id @equipment.equipment_locations.first.location_id
  json.location_type @equipment.equipment_locations.first.location_type
  json.location_name @equipment.equipment_locations.first.location.name
  json.status @equipment.equipment_locations.first.status
  json.coords @equipment.equipment_locations.first.coords
end
