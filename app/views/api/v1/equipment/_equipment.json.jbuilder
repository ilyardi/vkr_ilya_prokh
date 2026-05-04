json.(equipment, :id, :identifier, :model, :brand, :serial_number, :created_at, :comment)
json.equipment_type equipment.equipment_type.name
json.location equipment.equipment_locations.first.location.try(:name)
json.status equipment.equipment_locations.first.status
json.coords equipment.equipment_locations.first.coords
