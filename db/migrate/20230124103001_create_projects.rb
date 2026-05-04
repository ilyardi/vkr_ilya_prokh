class CreateProjects < ActiveRecord::Migration[6.1]
  def change
    create_table :projects do |t|
      t.string :name
      t.string :description
      t.references :project_type, foreign_key: true, null: false
      t.references :project_status, foreign_key: true, null: false
      t.references :responsible_user, foreign_key: { to_table: :users }
      t.datetime :plan_started_at
      t.datetime :plan_finished_at
      t.timestamps
    end
  end
end
