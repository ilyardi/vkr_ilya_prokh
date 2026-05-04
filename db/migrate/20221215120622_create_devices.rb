class CreateDevices < ActiveRecord::Migration[6.1]
  def change
    create_table :devices do |t|
      t.integer :external_id
      t.string :name
      t.string :ip
      t.timestamps
    end
  end
end
