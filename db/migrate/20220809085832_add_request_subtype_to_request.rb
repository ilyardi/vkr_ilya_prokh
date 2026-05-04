class AddRequestSubtypeToRequest < ActiveRecord::Migration[6.1]
  def change
    remove_column :requests, :work_type, :string
    add_reference :requests, :request_subtype, foreign_key: true
  end
end
