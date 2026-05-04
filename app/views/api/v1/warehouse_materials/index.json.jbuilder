json.materials do
    json.array! @warehouse_materials, partial: 'warehouse_material', as: :warehouse_material
end

json.meta do
    json.total @warehouse_materials.total_count
    json.current @current || 1
    json.pageSize @page_size || 20
    json.order @order
    json.orderBy @order_by
end
  