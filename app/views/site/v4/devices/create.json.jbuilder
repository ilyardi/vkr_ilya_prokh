if @device.errors.present?
  json.validation do
    json.device @device.errors
  end
else
  json.device do
    json.(@device, :device_token, :platform)
    json.user_id @device.abonent_id
  end
end
