class CreateBlockingServices < ActiveRecord::Migration[6.1]
  def change
    create_table :blocking_services do |t|
      t.bigint      :agrm_id, null: false
      t.references  :abonent, null: false
      t.datetime    :from_date, null: false
      t.datetime    :to_date, null: false
      t.string      :status, null: false, default: "created"
      t.boolean     :active, null: false, default: true
      t.integer     :request_ids, array: true, default: []
      t.datetime    :deleted_at
      t.timestamps
    end
  end
end
