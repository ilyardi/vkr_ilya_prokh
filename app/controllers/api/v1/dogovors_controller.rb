module Api
  module V1
    class DogovorsController < BaseController
      load_resource

      def destroy
        ActiveRecord::Base.transaction do
          dogovor = Dogovor.find(params[:id])
          abonent = dogovor.abonent
          dogovor.destroy!
          dogovors = abonent.dogovors
          if dogovors.present?
            dogovors.update_all(default: false)
            dogovors.first.update_column(:default, true)
          end
        end
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end
    end
  end
end
