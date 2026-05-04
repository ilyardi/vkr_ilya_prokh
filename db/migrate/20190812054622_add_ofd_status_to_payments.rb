class AddOfdStatusToPayments < ActiveRecord::Migration[5.2]
  def change
    add_column :payments, :ofd_status, :integer, default: 0
  end
end
