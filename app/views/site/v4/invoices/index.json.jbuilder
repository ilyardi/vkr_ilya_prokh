json.invoices do
  json.array! @invoices do |invoice|
    json.(invoice, :order_id)
    json.amount invoice.re_summ
    json.period invoice.period.to_time.to_i
    json.period_text I18n.l(invoice.period, format: '%B %Y').downcase
    json.address invoice.lb_agreement.lb_account.address_connect
  end
end

json.meta do
  json.total @invoices.total_count
  json.page @page
  json.per @per
end
