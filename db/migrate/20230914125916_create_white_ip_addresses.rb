class CreateWhiteIpAddresses < ActiveRecord::Migration[6.1]
  def change
    create_table :white_ip_addresses do |t|
      t.string :ip, null: false
      t.string :description
      t.string :comment, default: ""
      t.bigint :agrm_id
      t.timestamps
    end
  end
end
