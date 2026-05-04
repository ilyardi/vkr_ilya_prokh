class CreatePorts < ActiveRecord::Migration[6.1]
  def change
    create_table :ports do |t|
      t.integer :external_id
      t.integer :number
      t.string :state, default: "unknown"
      t.boolean :active, default: true
      t.references :device, foreign_key: true
      t.references :vgroup, foreign_key: true
      t.timestamps
    end
  end
end
