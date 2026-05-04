json.(document, :id, :title, :doc_type, :status, :agrm_id, :doc_url, :external_uid, :doc_token, :guid, :file_url, :doc_error, :archive, :created_at, :updated_at)

if document.errors.size > 0
    json.errors document.errors
end
