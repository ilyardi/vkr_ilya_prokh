class CreatePhoneDevices < ActiveRecord::Migration[6.1]
  def change
    create_table :phone_devices do |t|
      t.string  :device_token, null: false
      t.integer :platform
      t.boolean :active, default: true
      t.integer :abonent_id, index: true
      t.boolean :permission_infos, default: true
      t.boolean :permission_bills, default: true
      t.boolean :permission_lotto, default: true
      t.timestamps
    end
  end
end
