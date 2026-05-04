class ChangeColumnsNotificationRules < ActiveRecord::Migration[6.1]
  def change
    remove_reference :notification_rules, :target
    remove_reference :notification_rules, :sub_target
    remove_column :notification_rules, :action
    remove_column :notification_rules, :notify_fields

    add_column :notification_rules, :searcheble_types, :integer, array: true, default: []
    add_column :notification_rules, :searcheble_fields, :string, array: true, default: []
    add_column :notification_rules, :dislay_fields, :string, array: true, default: []
  end
end
