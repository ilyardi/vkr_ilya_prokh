expires = (Time.now + 10.seconds).to_i
json.uid document.id
json.name document.title
json.status 'done'
json.type document.file.present? ? File.extname(document.file.path)[1..-1] : 'folder'
# json.type document.doc_type
json.parent_id document.parent_id

json.download_url download_api_v1_document_url(document.id) unless document.errors.size > 0
json.url preview_api_v1_document_url(document.id, expires: expires, sign: Digest::MD5.hexdigest("#{expires}/#{document.id}")) unless document.errors.size > 0
json.errors document.errors if document.errors.size > 0
