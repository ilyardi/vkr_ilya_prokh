json.payments do
  json.array! @payments do |payment|
    json.amount payment.amount
    # json.comment payment.comment
    json.payed_at payment.pay_date.to_i
  end
end

json.meta do
  json.total @payments.total_count
  json.page @page
  json.per @per
end
