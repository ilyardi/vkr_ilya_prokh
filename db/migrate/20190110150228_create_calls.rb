class CreateCalls < ActiveRecord::Migration[5.2]
  def change
    create_table :calls do |t|
      t.references :lb_manager, null: false
      t.references :lb_account, null: false
      t.references :call_reason, null: false
      t.timestamps
    end
  end
end
