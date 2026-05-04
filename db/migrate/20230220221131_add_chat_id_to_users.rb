class AddChatIdToUsers < ActiveRecord::Migration[6.1]
  def change
    add_column :users, :chat_id, :string
  end
end
