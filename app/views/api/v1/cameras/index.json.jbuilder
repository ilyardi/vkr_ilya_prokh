json.cameras do
    json.array! @cameras, partial: 'camera', as: :camera
end

json.meta do
    json.total @cameras.total_count
    json.page page_param || 1
    json.per per_param || 20
    json.order @order
    json.order_by @order_by
end