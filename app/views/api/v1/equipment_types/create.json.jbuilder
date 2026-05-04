if @equipment_type.persisted?
  json.equipment_type do
    json.name @equipment_type.name
  end
else
  json.errors @equipment_type.errors.messages
end
