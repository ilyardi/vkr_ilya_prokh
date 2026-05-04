class GetDocGuidJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[GetDocGuidJob] #{exception.message}"
  end

  def perform(doc_id)
    document = AgreementDocument.find(doc_id)
    return unless document.present?
    guid = DocManager::Fdoc.new.get_doc_guid(document.doc_token)
    # to_do проверка на падение guid
    document.guid = guid
    # to_do ссылка действует час, нужна процедура обновления при скачивании
    document.file_url = "#{Settings.fdoc.url}/archive-srv/api/v1/archive/#{document.doc_token}/download/#{document.guid}" if guid.present?
    document.url_expired = Time.now+50.minute
    document.file_status = "done"
    document.save
    puts "[GET_DOC_GUID_JOB] #{guid}"
  end
end
