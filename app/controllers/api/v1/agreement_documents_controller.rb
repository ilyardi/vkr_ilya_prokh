module Api
  module V1
    class AgreementDocumentsController < BaseController
      def index
        filter = params[:search] || {}

        street_id = filter[:street_id] || nil
        building_id = filter[:building_id] || nil
        entrance_id = filter[:entrance_id] || nil
        flat_id = filter[:flat_id] || nil

        agrm_ids = []
        search_by_lb_agrm = street_id.present? || filter[:name].present? || filter[:phone].present? || filter[:number].present?

        if search_by_lb_agrm
          agreements = LbAgreement.joins(lb_account: :lb_accounts_addrs)
                                .where("accounts_addr.type=2 AND accounts.archive = 0 AND agreements.archive = 0")
          agreements = agreements.where("accounts.mobile LIKE ? OR accounts.phone LIKE ? OR accounts.fax LIKE ?","%#{filter[:phone]}%","%#{filter[:phone]}%","%#{filter[:phone]}%") if filter[:phone].present?
          agreements = agreements.where("agreements.number LIKE ?","%#{filter[:number]}%") if filter[:number].present?
          agreements = agreements.where("accounts.name LIKE ?","%#{filter[:name]}%") if filter[:name].present?
          agreements = agreements.where('accounts_addr.street = ?', street_id) if street_id.present?
          agreements = agreements.where("accounts_addr.building = ?", building_id) if building_id.present?
          agreements = agreements.where("accounts_addr.flat = ?", flat_id) if flat_id.present?
          agreements = agreements.where("accounts_addr.entrance = ?", entrance_id) if entrance_id.present?
          agrm_ids = agreements.pluck('agreements.agrm_id')
        end

        @agreement_documents = AgreementDocument.includes(lb_agreement: [:lb_account]).all
        @agreement_documents = @agreement_documents.where(agrm_id: agrm_ids) if search_by_lb_agrm
        @agreement_documents = @agreement_documents.where(status: filter[:statuses]) if filter[:statuses].present?
        @agreement_documents = @agreement_documents.order(:created_at => :desc)
        @agreement_documents = @agreement_documents.page(page_param).per(per_param)
      end

      def create
        @agreement_document = AgreementDocument.create(agreement_document_params)
        @agreement_document.send_fdoc
        set_bad_request(@agreement_document)
      end

      def show
      end

      def refresh_doc_url
        @agreement_document = AgreementDocument.find(params[:id])
        @agreement_document.get_doc_token unless @agreement_document.file_status == "performing"
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
            render status: :bad_request
        end
      end

      def agreement_document_params
        params.require(:agreement_document).permit(:agrm_id, :doc_type)
      end
    end
  end
end
