json.agreement_documents do
  json.array! @agreement_documents, partial: 'agreement_document', as: :agreement_document
end

json.statuses do
  json.array! I18n.t("models.agreement_document.statuses").map{|record| {value: record[0], label: record[1]}}
end

json.meta do
  json.total @agreement_documents.total_count
  json.page page_param
  json.per per_param
end
