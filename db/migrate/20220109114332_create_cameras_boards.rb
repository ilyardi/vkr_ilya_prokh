class CreateCamerasBoards < ActiveRecord::Migration[6.1]
  def change
    create_table :cameras_boards do |t|
      t.integer :abonent_id
      t.integer :camera_id
      t.integer :position
      t.timestamps
    end
  end
end
