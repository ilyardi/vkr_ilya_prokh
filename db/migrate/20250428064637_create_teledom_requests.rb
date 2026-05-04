class CreateTeledomRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :teledom_requests do |t|
      t.string      :status
      t.string      :subject
      t.text        :description
      t.string      :phone
      t.references  :user
      t.bigint      :agrm_id
      t.integer     :request_ids, array: true, default: []
      t.date        :deleted_at
      t.timestamps
    end
  end
end
