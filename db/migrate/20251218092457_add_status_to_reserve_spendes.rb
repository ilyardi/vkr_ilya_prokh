class AddStatusToReserveSpendes < ActiveRecord::Migration[6.1]
  def change
    add_column :reserve_spends, :status, :string, default: :created
  end
end
