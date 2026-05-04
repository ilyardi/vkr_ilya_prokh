class AddRtspUrlToCameras < ActiveRecord::Migration[6.1]
  def change
    add_column :cameras, :rtsp_url, :string
  end
end
