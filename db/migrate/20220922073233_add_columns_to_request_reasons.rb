class AddColumnsToRequestReasons < ActiveRecord::Migration[6.1]
  def change
    add_column :request_reasons, :service_type, :string
    add_column :request_reasons, :service_location, :string
  end
end
