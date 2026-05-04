json.equipment_types do
  json.array! @equipment_types, partial: 'equipment_type', as: :equipment_type
end

json.meta do
  json.total @equipment_types.total_count
  json.page @page || 1
  json.per @per || 20
  json.order @order
  json.orderBy @order_by
end
