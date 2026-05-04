class AddProjectManagersToProjects < ActiveRecord::Migration[6.1]
  def change
    add_column :projects, :project_managers_ids, :string, array: true, default: []
  end
end
