class UpdateForeignKey < ActiveRecord::Migration[5.2]
  def change
    remove_foreign_key :equipment_locations, :equipment
    add_foreign_key :equipment_locations, :equipment, on_delete: :cascade
  end
end
