class AddCommentToEquipments < ActiveRecord::Migration[5.2]
  def change
    add_column :equipment, :comment, :text
  end
end
