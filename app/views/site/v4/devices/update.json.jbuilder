json.device do
  json.(@device, :device_token, :platform, :permission_infos, :permission_bills, :permission_lotto)
  json.user_id @device.abonent_id
end
