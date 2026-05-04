class RenameDocumentsTable < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE documents
            RENAME TO site_documents
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE site_documents
            RENAME TO documents
        SQL
      end
    end
  end
end
