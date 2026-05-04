json.payments do
  json.array! @payments do |payment|
    json.(payment, :amount, :comment, :receipt, :pay_date, :local_date)
  end
end

json.meta do
  json.total @payments.total_count
  json.page @page
  json.per @per_page
end
