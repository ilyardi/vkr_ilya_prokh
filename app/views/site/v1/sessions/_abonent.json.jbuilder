json.abonent do
  json.(@abonent, :id, :phone)
end
# if address = @abonent.user_addresses.find_by(default: true) || @user.user_addresses.first
#   json.address do
#     json.(address, :id, :street, :building, :flat, :confirmed, :agrm_id, :default)
#   end
# end
