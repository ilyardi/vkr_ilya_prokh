class AddNameToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :name, :string

    User.find_each do |u|
      u.update_column(:name, u.email)
    end
  end
end
