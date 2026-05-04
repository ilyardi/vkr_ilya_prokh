json.agreement @lb_agreement, partial: 'lb_agreement', as: :lb_agreement

json.last_changes do
  json.descr @lb_agreement.lb_account.last_change_descr
end

json.connections @connections

json.attached_abonents do
  json.array! @lb_agreement.dogovors do |d|
    json.dogovor_id d.id
    json.id d.abonent.id
    json.phone d.abonent.phone
    json.email d.abonent.email
    json.unconfirmed_email d.abonent.unconfirmed_email
    json.created_at d.abonent.created_at
    json.updated_at d.abonent.updated_at
    json.confirmed_at d.updated_at
    json.bonus_rate d.abonent.bonus_rate
    json.confirmed_lk d.confirmed
    if d.abonent.auto_payment_methods.active.last.present?
      json.auto_payment_method d.abonent.auto_payment_methods.active.last, partial: 'auto_payment_method', as: :auto_payment_method
    end
  end
end

json.lk_teleset_charges do
  json.array! @lb_agreement.lb_teleset_charges do |lb_charge|
    json.id lb_charge.id
    json.fee lb_charge.fee
    json.month lb_charge.month
    # json.payment @lb_agreement.lb_payments.where('payments.pay_date BETWEEN ? AND ?', lb_charge.month + 1.month, (lb_charge.month + 1.month).end_of_month).sum{|q| q.amount}
  end
end

json.appeals do
  json.array! @lb_agreement.lb_account.calls.order(created_at: :desc) do |call|
    json.id call.id
    json.call_reason call.call_reason.name
    json.lb_manager call.lb_manager.fio
    json.date call.created_at
  end
end

json.personal do
  json.login @lb_agreement.lb_account.login
  json.pass @lb_agreement.lb_account.pass
end

json.tariffs @lb_agreement.get_tariffs

if @lb_agreement.bonus
  json.bonuses do
    json.current @lb_agreement.bonus.amount
    json.charges do
      json.array! @lb_agreement.bonus.charges.order('created_at DESC')
    end
  end
end
