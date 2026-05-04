json.warehouses do
  json.array! @warehouses, partial: 'warehouse', as: :warehouse
end
