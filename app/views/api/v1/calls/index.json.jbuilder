json.calls do
  json.array! @calls, partial: 'call', as: :call
end

json.meta do
  json.total @calls.total_count
  json.page @page || 1
  json.per @per || 20
end
