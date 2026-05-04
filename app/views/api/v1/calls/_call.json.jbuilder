json.id call.id
json.created_at call.created_at.to_i

json.call_reason call.call_reason.name
json.manager do
  json.(call.lb_manager, :fio)
end
json.account do
  json.(call.lb_account, :name, :address_connect)
end
