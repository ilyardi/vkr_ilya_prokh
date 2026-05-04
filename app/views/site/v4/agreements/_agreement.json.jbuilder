json.(agreement,
  :id,
  :street, :building, :flat,
  :confirmed, :agrm_id, :default, :number, :balance)

json.amount agreement.lb_agreement.get_services[:fee]
json.address "#{agreement.street}, #{agreement.building}-#{agreement.flat}"

json.bill_delivery agreement.lb_account.bill_delivery

if @bonus = Bonus.find_by(agrm_id: agreement.agrm_id)
  json.bonus do
    json.amount @bonus.amount
  end
end

if agreement.confirmed?
  json.(agreement, :name)
end

