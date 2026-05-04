class CreateRequestFirstReasons < ActiveRecord::Migration[6.1]
  def change
    create_table :request_first_reasons do |t|
      t.string :name, null: false
      t.timestamps
    end
  end
end
