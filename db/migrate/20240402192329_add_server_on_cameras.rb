class AddServerOnCameras < ActiveRecord::Migration[6.1]
  def change
    add_column :cameras, :server_id, :integer, default: 1
  end
end
