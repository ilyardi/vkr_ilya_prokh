json.(auto_payment_method, :amount, :date, :created_at)

json.card auto_payment_method.service == 'sberbank' ? auto_payment_method.card["pan"].slice(-4,4) : auto_payment_method.card["last4"]
