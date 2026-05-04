class AddSourceToLkPayments < ActiveRecord::Migration[6.1]
  def change
    add_column :lk_payments, :source, :string
  end
end
