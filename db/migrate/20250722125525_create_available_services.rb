class CreateAvailableServices < ActiveRecord::Migration[6.1]
  def change
    create_table :available_services do |t|
      t.integer   :building_id
      t.integer   :tar_id
      t.integer   :tar_id_free
      t.string    :service_type
      t.string    :service_name
      t.timestamps
    end
  end
end
