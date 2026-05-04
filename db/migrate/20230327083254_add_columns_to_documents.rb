class AddColumnsToDocuments < ActiveRecord::Migration[6.1]
  def change
    add_reference :documents, :parent, foreign_key: { to_table: :documents}
    add_column :documents, :type, :string
  end
end
