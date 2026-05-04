json.support_requests do
    json.array! @support_requests
end

json.meta do
    json.total @support_requests.total_count
    json.current @current || 1
    json.page_size @page_size || 20
    json.order @order
    json.orderBy @order_by
end