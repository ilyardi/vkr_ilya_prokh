json.data do
  json.address do
    json.partial! 'address', address: @address
  end
end