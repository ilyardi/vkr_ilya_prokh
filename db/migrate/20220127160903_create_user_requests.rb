class CreateUserRequests < ActiveRecord::Migration[6.1]
  def change
    create_table :user_requests do |t|
      t.string :name
      t.string :email
      t.string :phone
      t.string :address
      t.boolean :sent, default: false
      t.string :source_type
      t.timestamps
    end
  end
end
