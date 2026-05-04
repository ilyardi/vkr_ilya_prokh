json.(agreement,
  :id,
  :street, :building, :flat,
  :confirmed, :agrm_id, :default, :number, :balance)

lb_agreement = agreement.lb_agreement
building_id = lb_agreement.lb_account.lb_accounts_addrs.connection_type.first&.building
available_services = {}

AvailableService.where(building_id: building_id).each do |available_service|
  tarif = LbTarif.find_by(tar_id: available_service.tar_id)
  amount = tarif.present? ? tarif.get_rent : nil
  document_by_service = AgreementDocument.find_by(agrm_id: agreement.agrm_id, doc_type: available_service.service_type, status: ["signed", "wait_sign"])
  case document_by_service&.status
  when "signed"
    service_status = "success"
  when "wait_sign"
    service_status = "in_progress"
  else
    service_status = "avalible"
  end
  available_services[available_service.service_type] = {
    service_status: service_status,
    description: tarif.present? ? tarif.descr : available_service.service_name,
    amount: amount.to_i
  }
end

tariffs = {}
blocking_rent = 0
lb_agreement.get_tariffs.each do |record|
  next unless (record["blocked"] == 0 || record["blocked"] == 3)
  service_type = ""
  service_type = "tv" if record["descr"].include?("ТВ")
  service_type = "int" if record["descr"].include?("Инт")
  service_type = "svn" if record["descr"].include?("Видеонаблюдение")
  service_type = "teledom_ud" if record["descr"].include?("Умный домофон")
  service_type = "to_dom" if record["descr"].include?("ТО Домофона")
  amount = record["amount"]
  record[:addons].each do |addon|
    amount += addon[:amount]
  end
  if available_services[service_type].present?
    available_services[service_type].merge!({
      service_status: "success",
      description: record["descr"],
      amount: amount.to_i
    })
  end
  tariffs[service_type] ||= {}
  tariffs[service_type].merge!({
    description: record["descr"],
    amount: amount.to_i
  })
  # next unless (record["blocked"] == 0 || record["blocked"] == 3) && !(record["descr"].include?("Видеонаблюдение"))
  blocking_rent += 138 if record["descr"].downcase.include?("тв")
  blocking_rent += 100 if record["descr"].downcase.include?("инт")
end

sort_rule = ["tv", "int", "svn", "teledom_ud", "to_dom"]
sorted_available_services = {}
sorted_tariffs = {}
sort_rule.each do |rule|
  sorted_available_services[rule] = available_services[rule] if available_services[rule].present?
  sorted_tariffs[rule] = tariffs[rule] if tariffs[rule].present?
end

json.tariffs sorted_tariffs
json.available_services sorted_available_services

json.blocking_rent blocking_rent

json.blocking_service BlockingService.find_by(agrm_id: agreement.agrm_id, active: true)

json.amount lb_agreement.get_services[:fee]
json.address "#{agreement.street}, #{agreement.building}-#{agreement.flat}"

json.bill_delivery agreement.lb_account.bill_delivery

if @bonus = Bonus.find_by(agrm_id: agreement.agrm_id)
  json.bonus do
    json.amount @bonus.amount
  end
end

if promised_pay = lb_agreement.lb_payments.last_promised.first
  json.promised_payment do
    json.pay_date promised_pay.pay_date.to_i
    json.cancel_date promised_pay.cancel_date.to_i
  end
end

if agreement.confirmed?
  json.(agreement, :name)
end
