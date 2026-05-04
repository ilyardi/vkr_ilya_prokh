json.lb_agreements do
  json.array! @lb_agreements, partial: 'lb_agreement', as: :lb_agreement
end

json.meta do
  json.total @lb_agreements.total_count
  json.page page_param
  json.per per_param
end
