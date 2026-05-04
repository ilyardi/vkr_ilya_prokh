json.equipment_locations do
  json.array! @equipment_locations, partial: 'equipment_location', as: :equipment_location
end

json.meta do
  json.total @equipment_locations.total_count
  json.page @page || 1
  json.per @per || 20
  json.order @order
  json.orderBy @order_by
end
