json.id lb_agreement.id
json.value lb_agreement.id
json.uid lb_agreement.uid
json.number lb_agreement.number
json.type lb_agreement.lb_account.type


json.name lb_agreement.lb_account.name
json.ab_name lb_agreement.lb_account.abonent_name
json.ab_surname lb_agreement.lb_account.abonent_surname
json.ab_patronymic lb_agreement.lb_account.abonent_patronymic
json.bill_delivery lb_agreement.lb_account.bill_delivery
json.address lb_agreement.lb_account.address_connect
json.lk_status lb_agreement.lk_status
json.email lb_agreement.lb_account.email

json.mobile lb_agreement.lb_account.mobile
json.phone lb_agreement.lb_account.phone
json.fax lb_agreement.lb_account.fax
json.acc_type lb_agreement.lb_account.type

json.descr lb_agreement.lb_account.descr
json.tarifs lb_agreement.lb_account.lb_vgroups.blocked(false).map{|record| record.lb_tarif.descr}.join(", ")

json.fee lb_agreement.lb_teleset_charges[0].try(:fee)

payments = lb_agreement.lb_payments.joins("INNER JOIN pay_classes ON pay_classes.class_id = payments.class_id")
                                   .select('record_id as id, pay_classes.name as class_name, amount')
                                   .where('payments.pay_date BETWEEN ? AND ?', @month + 1.month, (@month + 1.month).end_of_month) if @month

json.class_name payments.present? ? payments.map{|q| q.class_name}.join(', ') : ''
json.payments payments.present? ? payments.sum{|q| q.amount} : 0

json.balance lb_agreement.balance

# json.abonents do
#   json.array! lb_agreement.dogovors.map(&:abonent), partial: 'abonent', as: :abonent
# end

# lb_agreement -> dogovors where agrm_id == lb_agr.id DISTINCT (take: abonent.name)


