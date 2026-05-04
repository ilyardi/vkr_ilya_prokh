json.equipment do
  json.array! @equipment, partial: 'equipment', as: :equipment
end

json.equipment_types do
  json.array! @equipment_types do |type|
    json.name type.name
  end
end

json.models @models
json.brands @brands
json.warehouses @warehouses
json.users @users

json.meta do
  json.total @equipment.total_count
  json.page @page || 1
  json.per @per || 20
  json.order @order
  json.orderBy @order_by
end
