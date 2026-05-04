class AddPassChangedAtToUser < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :pass_changed_at, :date, default: Time.now
  end
end
