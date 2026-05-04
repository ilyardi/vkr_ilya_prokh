if @address.errors.present?
  json.validation do
    json.address @address.errors
  end
else
  json.data do
    json.address do
      json.partial! 'address', address: @address
    end
    json.user do
      json.(current_abonent, :email)
    end
  end
end
