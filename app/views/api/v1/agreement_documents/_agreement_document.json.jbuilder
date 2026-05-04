json.(agreement_document,
  :id,
  :title,
  :status,
  :file_status,
  :doc_type,
  :doc_token,
  :guid,
  :file_url,
  :url_expired,
  :agrm_id,
  :external_uid,
  :archive,
  :created_at
)

lb_agreement = agreement_document.lb_agreement

json.status_name I18n.t("models.agreement_document.statuses.#{agreement_document.status}")
json.can_action ["signed", "annuled"].include?(agreement_document.status)

# json.doc_url agreement_document.url_expired.present? && agreement_document.url_expired > Time.now ? agreement_document.doc_url : nil
json.url_relevant agreement_document.url_expired.present? && agreement_document.url_expired > Time.now

json.agreement do
  json.agrm_id lb_agreement.agrm_id
  json.uid lb_agreement.uid
  json.address lb_agreement.lb_account.address_connect
  json.number lb_agreement.number
end
