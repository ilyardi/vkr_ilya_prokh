json.rows do
  json.array! @rows, partial: 'irc_account_saldo', as: :irc_account_saldo
end

json.totals @totals

json.meta do
  json.total @rows.total_count
  json.page @page || 1
  json.per @per || 20
end
