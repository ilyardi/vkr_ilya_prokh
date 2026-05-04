json.(warehouse_material_move, :id, :operation_type, :quantity, :created_at)

json.warehouse_material do
    json.(warehouse_material_move.warehouse_material, :id, :name, :code, :coords, :quantity, :unit)
    json.warehouse_material_category do
        json.(warehouse_material_move.warehouse_material.warehouse_material_category, :id, :name)
    end
end

if warehouse_material_move.user
    json.user do
        json.(warehouse_material_move.user, :id, :name)
    end
end

json.created_by do
    json.(warehouse_material_move.created_by, :id, :name)
end
if warehouse_material_move.errors.size > 0
    json.errors warehouse_material_move.errors
end
