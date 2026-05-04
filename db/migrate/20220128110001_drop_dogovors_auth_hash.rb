class DropDogovorsAuthHash < ActiveRecord::Migration[6.1]
  def change
    remove_column :dogovors, :auth_hash
  end
end
