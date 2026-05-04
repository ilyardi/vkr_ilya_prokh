json.white_ip_addresses do
    json.array! @white_ip_addresses, partial: 'white_ip_address', as: :white_ip_address
end

json.meta do
    json.total @white_ip_addresses.total_count
    json.page page_param
    json.per per_param
    json.order @order
    json.order_by @order_by
end
