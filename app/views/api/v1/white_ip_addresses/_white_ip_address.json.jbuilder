json.(white_ip_address, :id, :agrm_id, :ip, :description, :comment, :created_at, :updated_at)

json.agreement do
  agreement = white_ip_address.lb_agreement
  json.agrm_id agreement&.agrm_id
  json.number agreement&.number
end
