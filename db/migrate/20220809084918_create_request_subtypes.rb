class CreateRequestSubtypes < ActiveRecord::Migration[6.1]
  def change
    create_table :request_subtypes do |t|
      t.references :request_type, foreign_key: true, null: false
      t.string :name, null: false
      t.timestamps
    end
  end
end
