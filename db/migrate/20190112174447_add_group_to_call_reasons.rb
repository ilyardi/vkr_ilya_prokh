class AddGroupToCallReasons < ActiveRecord::Migration[5.2]
  def change
    add_column :call_reasons, :group, :string
  end
end
