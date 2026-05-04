json.rows do
  json.array! @rows, partial: 'agreement', as: :agreement
end

json.total_saldo @total_saldo
json.saldos @saldos

json.meta do
  json.total @rows.total_count
  json.page @page || 1
  json.per @per || 20
end
