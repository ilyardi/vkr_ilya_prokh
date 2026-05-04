class ChangeUsersRoleToInteger < ActiveRecord::Migration[5.2]
  def change
    change_column :users, :role, 'integer USING role::integer'
  end
end
