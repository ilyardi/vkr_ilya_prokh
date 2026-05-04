json.auto_payment_methods do
  json.array! @auto_payment_methods, partial: 'auto_payment_method', as: :auto_payment_method
end

json.total_sum @total_sum

json.meta do
  json.total @auto_payment_methods.total_count
  json.page page_param
  json.per per_param
end
