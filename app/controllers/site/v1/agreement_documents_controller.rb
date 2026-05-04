module Site
  module V1
    class AgreementDocumentsController < Site::V1::BaseController

      def create
        @agreement_document = AgreementDocument.create(agreement_document_params)
        #to_do добавить проверку на повторный выхзов процедуры
        @agreement_document = @agreement_document.send_fdoc unless @agreement_document.errors.present?
        set_bad_request(@agreement_document)
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
