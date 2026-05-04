class AddDogovorBlockedAt < ActiveRecord::Migration[6.1]
  def change
    add_column :dogovors, :blocked_at, :datetime, null: true, default: nil
  end
end
