json.(lb_payment, :record_id, :status, :amount, :teleset_service_type)
json.pay_date lb_payment.pay_date.try(:strftime, "%d.%m.%Y %H:%M")
json.local_date lb_payment.local_date.try(:strftime, "%d.%m.%Y %H:%M")
json.buh_date (lb_payment.buh_date.nil?) ? 0 : lb_payment.buh_date.to_time.to_i
json.cancel_date lb_payment.cancel_date.try(:strftime, "%d.%m.%Y %H:%M")
json.class_name lb_payment.lb_class.name
json.agrm_number lb_payment.lb_agreement.number
json.address LbAccount.address_connect(lb_payment.lb_agreement.uid)
json.account_type lb_payment.lb_agreement.lb_account.type

