class AddDeprtmentToUsers < ActiveRecord::Migration[6.1]
  def change
    add_reference :users, :department, foreign_key: true
    add_column :users, :active, :boolean, default: true
  end
end
