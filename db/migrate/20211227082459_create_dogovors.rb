class CreateDogovors < ActiveRecord::Migration[6.1]
  def change
    create_table :dogovors do |t|
      t.belongs_to :abonent, index: true
      t.boolean :confirmed, default: false
      t.boolean :default, default: false
      t.string :street
      t.string :building
      t.string :flat
      t.integer :agrm_id
      t.string :auth_hash
      t.timestamps
    end
  end
end
