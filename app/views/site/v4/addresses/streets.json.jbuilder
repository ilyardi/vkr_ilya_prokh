json.suggestions do
  json.array! @addresses do |address|
    json.id address["record_id"]
    json.value "#{address["short"]}. #{address["name"]}"
  end
end
