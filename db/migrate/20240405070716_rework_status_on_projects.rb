class ReworkStatusOnProjects < ActiveRecord::Migration[6.1]
  def change
    remove_reference :projects, :project_status
    add_column :projects, :status, :string, null: false, default: "at_work"
  end
end
