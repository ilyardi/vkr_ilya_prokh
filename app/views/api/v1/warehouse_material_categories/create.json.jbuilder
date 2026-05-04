json.category @warehouse_material_category

if @warehouse_material_category.errors.size > 0
    json.errors @warehouse_material_category.errors
end
