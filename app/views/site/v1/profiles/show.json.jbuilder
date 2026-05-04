json.data do
  json.user do
    json.(current_abonent, :id, :phone, :email, :unconfirmed_email)
    json.created_at current_abonent.created_at.to_i
    json.user_hash OpenSSL::HMAC.hexdigest('sha256', Settings.intercom.secret, current_abonent.id.to_s)
    if agrm = current_abonent.current_dogovor
      json.(agrm.lb_account.from_bill_delivery, :accept, :manual_delivery)
      json.bill_delivery agrm.lb_account.bill_delivery
    end
    json.unread_notifications current_abonent.notifications.created.count
  end
  if agrm = current_abonent.current_dogovor
    json.current_agreement do
      json.partial! 'site/v1/agreements/agreement', agreement: agrm
      if auto_payment = current_abonent.auto_payment_methods.available.where(agrm_id: agrm.agrm_id).last
        json.auto_payment do
          json.partial! 'auto_payment', auto_payment: auto_payment
        end
      end
    end
  end
end
