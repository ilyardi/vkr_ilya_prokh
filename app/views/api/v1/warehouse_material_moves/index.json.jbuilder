json.material_moves do
    json.array! @warehouse_material_moves, partial: 'warehouse_material_move', as: :warehouse_material_move
end

json.meta do
    json.total @warehouse_material_moves.total_count
    json.current @current || 1
    json.pageSize @page_size || 20
    json.order @order
    json.orderBy @order_by
end