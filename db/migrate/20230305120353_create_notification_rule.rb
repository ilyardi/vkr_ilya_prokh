class CreateNotificationRule < ActiveRecord::Migration[6.1]
  def change
    create_table :notification_rules do |t|
      t.references :user
      t.references :target, polymorphic: true
      t.references :sub_target, polymorphic: true
      t.string :action
      t.string :notify_fields, array: true
      t.timestamps
    end
  end
end
