class AddManagerIdToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :lb_manager_id, :integer
  end
end
