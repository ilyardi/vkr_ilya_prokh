class AddCheckedAtToExpenses < ActiveRecord::Migration[6.1]
  def change
    add_column :expenses, :checked_at, :datetime
  end
end
