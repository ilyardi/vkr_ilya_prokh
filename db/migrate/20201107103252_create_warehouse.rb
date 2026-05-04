class CreateWarehouse < ActiveRecord::Migration[5.2]
  def change
    create_table :warehouses do |t|
      t.string :name
    end
  end
end
