if @address.errors.present?
  json.validation do
    json.agreement @address.errors
  end
else
  json.agreement do
    json.partial! 'site/v4/agreements/agreement', agreement: @address
  end
  json.user do
    json.partial! 'site/v4/shared/user', user: current_abonent
  end
end
