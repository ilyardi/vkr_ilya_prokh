json.expenses @expenses, partial: 'list', as: :expense

json.total do
    json.count @expenses.total_count
    json.amount @total_fee
end

json.meta do
    json.total @expenses.total_count
    json.page page_param
    json.per per_param
    json.order @order
    json.order_by @order_by
end
