class AddParentIdInRequest < ActiveRecord::Migration[6.1]
  def change
    add_reference :requests, :parent, foreign_key: { to_table: :requests }
  end
end
