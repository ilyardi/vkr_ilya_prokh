if @phone_confirmation
  json.phone_confirmation do
    json.(@phone_confirmation, :phone)
  end
else
  json.validation do
    json.phone_confirmation do
      json.code [I18n.t("site.v1.phone_confirmations_controller.confirm.failed")]
    end
  end
end
