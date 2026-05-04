class CreateSupportRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :support_requests do |t|
      t.string  :phone
      t.text    :message
      t.boolean :sent, default: false
      t.string  :source_type
      t.timestamps
    end
  end
end
