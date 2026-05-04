json.user_requests do
    json.array! @user_requests
end

json.meta do
    json.total @user_requests.total_count
    json.current @current || 1
    json.page_size @page_size || 20
    json.order @order
    json.orderBy @order_by
end