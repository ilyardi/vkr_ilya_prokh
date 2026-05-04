class CreateWarehouseMaterials < ActiveRecord::Migration[5.2]
  def change
    create_table :warehouse_materials do |t|
      t.string :name, null: false
      t.string :code, unique: true
      t.string :unit, default: 'piece'
      t.bigint :quantity, null: false, default: 0
      t.references :warehouse_material_category, foreign_key: true
      t.jsonb :coords, default: {}
      t.timestamps
    end
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE warehouse_materials
            ADD CONSTRAINT only_positive
              CHECK (quantity >= 0);
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE warehouse_materials
            DROP CONSTRAINT only_positive
        SQL
      end
    end
  end
end
