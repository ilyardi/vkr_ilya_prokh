module Api
  module V1
    class AvailableServicesController < BaseController
      before_action :set_available_service, only: [:show, :update, :destroy]

      def index
        @available_services = AvailableService.all
        @available_services = @available_services.page(page_param).per(per_param)
      end

      def show
        render json: @available_service
      end

      def create
        @available_service = AvailableService.create(available_service_params)
        set_bad_request(@available_service)
      end

      def update
        @available_service.update(available_service_params)
        set_bad_request(@available_service)
      end

      def destroy
        @available_service.destroy
        head :no_content
      end

      private

      def set_available_service
        @available_service = AvailableService.find(params[:id])
      end

      def set_bad_request(model)
        if model.errors.size > 0
          render json: { errors: model.errors }, status: :bad_request
        end
      end

      def available_service_params
        params.require(:available_service).permit(:building_id, :tar_id, :tar_id_free, :service_type, :service_name)
      end
    end
  end
end
