class CreateProjectStatuses < ActiveRecord::Migration[6.1]
  def change
    create_table :project_statuses do |t|
      t.string :name, null: false
      t.boolean :active, default: true
      t.references :project_type, foreign_key: true
      t.timestamps
    end
  end
end
