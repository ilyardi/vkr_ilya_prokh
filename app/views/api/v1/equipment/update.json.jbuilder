if @equipment.errors.messages.empty? && @location.errors.messages.empty?
  json.equipment do
    json.(@equipment, :id, :identifier, :model, :brand, :serial_number, :created_at, :comment, :equipment_type_id)
    json.location_id @location.location.id
    json.location_type @location.location_type
    json.status @location.status
    json.coords @location.coords
  end
elsif @equipment && !@equipment.errors.messages.empty?
  json.errors @equipment.errors.messages
elsif @location && !@location.errors.messages.empty?
  json.errors @location.errors.messages
end
