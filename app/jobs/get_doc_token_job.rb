class GetDocTokenJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[GetDocTokenJob] #{exception.message}"
  end

  def perform(doc_id)
    document = AgreementDocument.find(doc_id)
    return unless document.present?
    doc_token = DocManager::Fdoc.new.get_doc_token(document.external_uid)
    document.doc_token = doc_token
    puts "[DOC_TOKEN] #{doc_token}"

    # if document.doc_token.present?
    #   guid = DocManager::Fdoc.new.get_doc_guid(document.doc_token)
    #   document.guid = guid
    #   document.file_url = "#{Settings.fdoc.url}/archive-srv/api/v1/archive/#{document.doc_token}/download/#{document.doc_token}" if document.doc_token.present?
    #   puts "[GUID] #{guid}"
    #   puts "[FILE_URL] #{document.file_url}"
    # end

    document.save
    puts "[GET_DOC_TOKEN] #{document.id}]"
  end
end
