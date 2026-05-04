class CreateWarehouseMaterialMoves < ActiveRecord::Migration[5.2]
  def change
    create_table :warehouse_material_moves do |t|
      t.references :warehouse_material, foreign_key: true
      t.column :operation_type, :integer
      t.decimal :quantity
      t.references :user, foreign_key: true
      t.references :created_by, foreign_key: { to_table: :users }
      t.timestamps
    end
  end

end
