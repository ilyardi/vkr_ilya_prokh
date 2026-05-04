json.payments do
    json.array! @lk_payments, partial: 'lk_payment', as: :payment
end

json.meta do
  json.total @lk_payments.total_count
  json.page page_param
  json.per per_param
  json.order @order
  json.order_by @order_by
end
