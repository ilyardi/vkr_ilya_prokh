class AddActiveToRequestTypes < ActiveRecord::Migration[6.1]
  def change
    add_column :request_types, :active, :boolean, default: true
  end
end
