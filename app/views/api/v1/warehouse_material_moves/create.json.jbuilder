json.material_moves do
    json.array! @moves, partial: 'warehouse_material_move', as: :warehouse_material_move
end
json.has_error @has_errors
