class CreateRequestTypes < ActiveRecord::Migration[6.1]
  def change
    create_table :request_types do |t|
      t.string :name
      t.integer :alert_timer
      t.timestamps
    end
  end
end
