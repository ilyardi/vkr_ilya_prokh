json.str_value vgroup['str_value']
json.address vgroup['address']
json.number vgroup['number']
json.usluga vgroup['usluga']
json.acc_ondate vgroup['acc_ondate'].try(:strftime, "%d.%m.%Y %H:%M")
json.bill_delivery vgroup['bill_delivery']
json.tarif vgroup['tarif']
json.lk_status LbAgreement.find(vgroup['agrm_id']).lk_status
