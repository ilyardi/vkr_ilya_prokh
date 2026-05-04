class CreateWarehouseMaterialCategories < ActiveRecord::Migration[5.2]
    def change
      create_table :warehouse_material_categories do |t|
        t.string :name, null: false
        t.timestamps
      end
    end
end