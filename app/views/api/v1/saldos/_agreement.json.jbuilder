json.(agreement, :agrm_id, :balance, :number, :archive, :date)
json.account do
  json.uid agreement.uid
  json.name agreement.lb_account.name
  json.address agreement.lb_account.address_connect
end
