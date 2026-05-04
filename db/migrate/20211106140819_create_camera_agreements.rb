class CreateCameraAgreements < ActiveRecord::Migration[5.2]
  def change
    create_table :camera_agreements do |t|
      t.integer :camera_id
      t.integer :agrm_id
      t.timestamps
    end
  end
end
