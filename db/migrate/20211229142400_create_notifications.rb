class CreateNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :notifications do |t|
      t.string :notification_type, null: false
      t.integer :status
      t.json    :data
      t.integer :recipient_id
      t.string :recipient_type
      t.timestamps
    end

    add_index :notifications, [:recipient_id, :recipient_type]
  end
end
