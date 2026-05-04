json.lb_agreements do
  json.array! @lb_agreements do |lb_agreement|
    json.id lb_agreement.id
    json.uid lb_agreement.uid
    json.value lb_agreement.id
    json.name lb_agreement.lb_account.name
    json.label "#{lb_agreement.lb_account.name} (#{lb_agreement.number})"
    json.agreement_number lb_agreement.number
    json.address lb_agreement.lb_account.address_connect
    json.phone lb_agreement.lb_account.mobile
  end
end
