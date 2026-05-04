class AddActiveToRequestStatuses < ActiveRecord::Migration[6.1]
  def change
    add_column :request_statuses, :active, :boolean, default: true
  end
end
