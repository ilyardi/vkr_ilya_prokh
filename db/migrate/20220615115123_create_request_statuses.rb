class CreateRequestStatuses < ActiveRecord::Migration[6.1]
  def change
    create_table :request_statuses do |t|
      t.references :request_type, foreign_key: true, null: false
      t.integer :priority
      t.string :name, null: false
      t.integer :alert_timer
      t.boolean :after_finish
      t.timestamps
    end
  end
end
