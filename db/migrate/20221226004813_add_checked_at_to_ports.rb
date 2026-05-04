class AddCheckedAtToPorts < ActiveRecord::Migration[6.1]
  def change
    add_column :ports, :checked_at, :datetime
  end
end
