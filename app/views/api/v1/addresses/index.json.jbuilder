json.suggestions do
  json.array! @addresses do |address|
    json.value address["name"]
    json.id address["record_id"]
  end
end
