class AddColumnsToRequests < ActiveRecord::Migration[6.1]
  def change
    add_reference :requests, :car, foreign_key: { to_table: :users }
    add_reference :requests, :helper_user, foreign_key: { to_table: :users }
  end
end
