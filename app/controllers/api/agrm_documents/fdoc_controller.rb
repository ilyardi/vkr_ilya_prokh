class Api::AgrmDocuments::FdocController < Site::BaseController
  def set_status
    perform
  end

  private

  def perform
    agreement_document = AgreementDocument.find_by(external_uid: params["packageId"])
    if agreement_document.present?
      case params["status"]
      when "SIGNED"
        agreement_document.signed!
        agreement_document.get_doc_token
        agreement_document.approve_service
      when "CANCELED", "SIGNING_EXPIRED"
        agreement_document.canceled!
      when "ANNULED"
        agreement_document.annuled!
      when "ERROR_ANNUL","ERROR_SEND","ERROR_SIGN"
        agreement_document.doc_error = params["statusName"]
        agreement_document.error!
      end
    end
    render json: {success: true}, status: 200
  end
end
