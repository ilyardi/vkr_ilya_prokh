json.(@account, :uid, :name)
json.address @account.address_connect(as_hash: true)
json.agreements do
  json.array! @agreements do |ag|
    json.(ag, :agrm_id, :number, :balance)
  end
end
