json.(auto_payment_method, :id, :amount, :date, :status, :active, :created_at, :updated_at)

json.abonent do
  json.id auto_payment_method.abonent_id
  json.phone auto_payment_method.abonent&.phone
end

json.lb_agreement do
  json.agrm_id auto_payment_method.agrm_id
  json.number auto_payment_method.lb_agreement&.number
end
