json.(user, :id, :phone)
json.email user.email.presence || user.unconfirmed_email
json.login ""
json.unread_notifications user.notifications.created.count
if agrm = user.current_dogovor
    json.(agrm.lb_account.from_bill_delivery, :accept, :manual_delivery)
    json.bill_delivery agrm.lb_account.bill_delivery
end
