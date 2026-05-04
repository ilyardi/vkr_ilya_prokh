class CreateProjectTypes < ActiveRecord::Migration[6.1]
  def change
    create_table :project_types do |t|
      t.string :name, null: false
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
