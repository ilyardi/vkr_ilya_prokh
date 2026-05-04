json.lb_payments do
  json.array! @lb_payments, partial: 'lb_payment', as: :lb_payment
end
json.lb_classes do
  json.array! @lb_classes, partial: 'lb_class', as: :lb_class
end

json.total_amount  @total_amount

json.meta do
  json.total @lb_payments.total_count
  json.page @page || 1
  json.per @per || 50
  json.order_by @order_by
  json.order @order
end
