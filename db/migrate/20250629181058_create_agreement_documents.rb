class CreateAgreementDocuments < ActiveRecord::Migration[6.1]
  def change
    create_table :agreement_documents do |t|
      t.string :title
      t.string :doc_type
      t.string :status, default: :created
      t.integer :agrm_id
      t.string :doc_url
      t.string :external_uid
      t.string :doc_token
      t.string :guid
      t.string :file_url
      t.string :doc_error
      t.boolean :archive, default: false
      t.timestamps
    end
  end
end
