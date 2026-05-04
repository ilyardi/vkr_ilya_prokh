json.suggestions do
  json.array! @records do |r|
    json.value "#{r["name"]}#{r["block"].present? ? " к.#{r["block"]}" : ""}"
    json.id r["record_id"]
  end
end
