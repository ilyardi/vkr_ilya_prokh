json.material_categories do
    json.array! @warehouse_material_categories, partial: 'warehouse_material_category', as: :warehouse_material_category
end