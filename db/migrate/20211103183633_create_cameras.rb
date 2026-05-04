class CreateCameras < ActiveRecord::Migration[5.2]
  def change
    create_table :cameras do |t|
      t.string :token, null: false
      t.string :name, null: false
      t.string :camera_type
      t.string :secure_token
      t.boolean  :is_private, default: false
      t.boolean  :is_archive, default: false


      t.string :street
      t.string :building
      t.float :longitude
      t.float :latitude

      t.boolean :active, default: true
      t.timestamps
    end
  end
end
