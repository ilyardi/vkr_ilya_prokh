class ChangeUnconfirmedEmail < ActiveRecord::Migration[6.1]
  def change
    change_column :abonents, :unconfirmed_email, :string
  end
end
