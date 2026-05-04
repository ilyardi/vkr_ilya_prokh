class AddColumsToCameras < ActiveRecord::Migration[6.1]
  def change
    add_column :cameras, :model, :string
    add_column :cameras, :serial, :string
    add_column :cameras, :mac, :string
    add_column :cameras, :ip, :string
    add_column :cameras, :description, :string
    add_column :cameras, :screenshot, :string
    add_column :cameras, :archive_depth, :integer
  end
end
