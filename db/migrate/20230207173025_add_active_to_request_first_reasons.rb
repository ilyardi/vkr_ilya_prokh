class AddActiveToRequestFirstReasons < ActiveRecord::Migration[6.1]
  def change
    add_column :request_first_reasons, :active, :boolean, default: true
  end
end
