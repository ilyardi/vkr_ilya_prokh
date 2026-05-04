json.(auto_payment, :id, :amount, :date, :status, :payer_data, :active)
json.card_number (auto_payment.card["pan"] || "").downcase
