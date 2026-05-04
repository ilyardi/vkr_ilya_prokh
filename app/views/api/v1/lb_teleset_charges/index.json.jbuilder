json.lb_teleset_charges do
  json.array! @lb_teleset_charges, partial: 'lb_teleset_charge', as: :lb_teleset_charge
end

json.meta do
  json.total @lb_teleset_charges.total_count
  json.page page_param
  json.per per_param
  json.order_by @order_by
  json.order @order
end