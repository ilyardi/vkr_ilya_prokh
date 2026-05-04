class CreateProducts < ActiveRecord::Migration[6.1]
  def change
    create_table :products do |t|
      t.string  :title, null: false
      t.text    :description
      t.string  :poster
      t.string  :file
      t.decimal :price
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
