class CreateCallReasons < ActiveRecord::Migration[5.2]
  def change
    create_table :call_reasons do |t|
      t.string  :name, null: false
      t.integer :position
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
