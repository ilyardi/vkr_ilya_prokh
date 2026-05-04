json.agreements do
  json.array! @addresses, partial: 'agreement', as: :agreement
end
