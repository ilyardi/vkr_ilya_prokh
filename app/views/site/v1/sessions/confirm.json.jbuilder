json.abonent do
  json.id @abonent.id
  # if address = @abonent.user_addresses.find_by(default: true) || @abonent.user_addresses.first
  #   json.address do
  #     json.(address, :id, :street, :building, :flat, :confirmed, :agrm_id, :default)
  #   end
  # end
end
