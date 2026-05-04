class ChangeColumnTypeOnDocuments < ActiveRecord::Migration[6.1]
  def change
    remove_column :documents, :type, :string
    add_column :documents, :doc_type, :string, default: :file
  end
end
