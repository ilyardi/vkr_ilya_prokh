class CreateUserNotifications < ActiveRecord::Migration[6.1]
  def change
    create_table :user_notifications do |t|
      t.string :status, default: :created
      t.references :user
      t.references :version
      t.jsonb :data
      t.timestamps
    end
  end
end
