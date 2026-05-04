class CreateRequestReasons < ActiveRecord::Migration[6.1]
  def change
    create_table :request_reasons do |t|
      t.text :description, null: false
      t.timestamps
    end
  end
end
