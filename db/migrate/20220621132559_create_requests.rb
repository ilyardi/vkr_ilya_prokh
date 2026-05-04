class CreateRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :requests do |t|
      t.references :request_type, foreign_key: true, null: false
      t.references :request_status, foreign_key: true, null: false
      t.references :resource, polymorphic: true
      t.references :request_reason, foreign_key: true
      t.references :responsible_user, foreign_key: { to_table: :users }
      t.references :executor_user, foreign_key: { to_table: :users }
      t.string :description
      t.text :comment
      t.string :work_type
      t.datetime :plan_started_at
      t.datetime :plan_finished_at
      t.datetime :status_updated_at
      t.datetime :status_notified_at
      t.timestamps
    end
  end
end
