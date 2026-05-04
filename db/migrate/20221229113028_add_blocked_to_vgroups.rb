class AddBlockedToVgroups < ActiveRecord::Migration[6.1]
  def change
    add_column :vgroups, :blocked, :integer
  end
end
