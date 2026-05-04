json.suggestions do
    json.array! @addresses do |address|
        json.value json.value "#{address["name"]}#{address["block"].present? ? " к.#{address["block"]}" : ""}"
        json.id address["record_id"]
    end
end