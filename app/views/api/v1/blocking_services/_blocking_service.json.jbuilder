json.(blocking_service, :id, :from_date, :to_date, :active, :status, :created_at)

json.abonent blocking_service.abonent

json.agreement do
  json.partial! 'api/v1/lb_agreements/lb_agreement', lb_agreement: blocking_service.lb_agreement
end

json.events []

# json.agreement do
#   json.number blocking_service.lb_agreement.number
#   json.address blocking_service.lb_agreement.lb_account.address_connect
# end
