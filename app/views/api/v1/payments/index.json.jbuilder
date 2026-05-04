json.payments do
  json.array! @payments, partial: 'payment', as: :payment
end

json.meta do
  json.total @payments.total_count
  json.page @page || 1
  json.per @per || 20
end
