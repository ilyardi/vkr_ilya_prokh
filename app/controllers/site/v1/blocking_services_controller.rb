module Site
  module V1
    class BlockingServicesController < Site::V1::BaseController
      def create
        @blocking_service = BlockingService.create(blocking_service_params)
      end

      def destroy
        @blocking_service = BlockingService.find(params[:id])
        @blocking_service.unblocking!
      end

      private

      def blocking_service_params
        params.require(:blocking_service).permit(:agrm_id, :from_date, :to_date, :abonent_id)
      end
    end
  end
end
