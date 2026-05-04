
json.lb_agreements do
  json.array! @lb_agreements, partial: 'lb_agreement', as: :lb_agreement
end

json.total do
  json.fee @total_fee
  json.payments @total_payments
  json.payments_count @total_payments_count
end

json.lb_classes do
  json.array! @lb_classes, partial: 'lb_class', as: :lb_class
end

json.meta do
  json.total @lb_agreements.total_count
  json.page page_param
  json.per per_param
end
  