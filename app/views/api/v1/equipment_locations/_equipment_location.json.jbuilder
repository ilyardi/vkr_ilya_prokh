json.location_type equipment_location.location_type
json.name equipment_location.location.name
json.status equipment_location.status
json.changed_by User.find(equipment_location.changed_by).email
json.created_at equipment_location.created_at
