class AddUrlExpiredToAgreementDocuments < ActiveRecord::Migration[6.1]
  def change
    add_column :agreement_documents, :url_expired, :datetime
    add_column :agreement_documents, :file_status, :string, default: "file_none"
  end
end
