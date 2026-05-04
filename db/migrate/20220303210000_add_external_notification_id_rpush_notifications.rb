class AddExternalNotificationIdRpushNotifications < ActiveRecord::Migration[5.0]
  def change
    add_column :rpush_notifications, :external_notification_id, :integer, index: true
  end
end
