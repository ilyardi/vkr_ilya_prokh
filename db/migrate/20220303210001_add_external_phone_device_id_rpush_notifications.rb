class AddExternalPhoneDeviceIdRpushNotifications < ActiveRecord::Migration[5.0]
  def change
    add_column :rpush_notifications, :external_phone_device_id, :integer, index: true
  end
end
