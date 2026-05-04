json.(warehouse_material, :id, :name, :code, :unit, :quantity, :coords, :warehouse_material_category_id)

if warehouse_material.warehouse_material_category_id != nil
    json.warehouse_material_category do
        json.(warehouse_material.warehouse_material_category, :id, :name)
    end
end

if warehouse_material.errors.size > 0
    json.errors warehouse_material.errors
end