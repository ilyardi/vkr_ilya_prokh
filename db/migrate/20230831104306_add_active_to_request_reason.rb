class AddActiveToRequestReason < ActiveRecord::Migration[6.1]
  def change
    add_column :request_reasons, :active, :boolean, default: true
  end
end
