class ChangeColumnProjectStatusIdInProjects < ActiveRecord::Migration[6.1]
  def change
    change_column_null :projects, :project_status_id,  true
  end
end
