if @phone_confirmation.errors.present?
  json.validation do
    json.phone_confirmation @phone_confirmation.errors
  end
else
  json.phone_confirmation do
    json.(@phone_confirmation, :phone)
  end
end
