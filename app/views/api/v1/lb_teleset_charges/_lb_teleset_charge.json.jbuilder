json.(lb_teleset_charge, :id, :agrm_id, :month, :fee)

json.paid LbAgreement.find(lb_teleset_charge.agrm_id).lb_payments.where('payments.pay_date BETWEEN ? AND ?', lb_teleset_charge.month + 1.month, (lb_teleset_charge.month + 1.month).end_of_month).sum{|q| q.amount}