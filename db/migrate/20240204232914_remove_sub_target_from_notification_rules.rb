class RemoveSubTargetFromNotificationRules < ActiveRecord::Migration[6.1]
  def change
    remove_column :notification_rules, :sub_target_type
  end
end
