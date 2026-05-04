json.data do
  json.addresses do
    json.array! @addresses, partial: 'address', as: :address
  end
end