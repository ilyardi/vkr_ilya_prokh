module Api
  module V1
    class RequestTypesController < BaseController
      def index
        @request_types = RequestType.active.all.order(name: :asc)
      end

      def create
        @request_type = RequestType.create(request_type_params)
        set_bad_request(@request_type)
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def request_type_params
        params.require(:request_type).permit(:name, :alert_timer)
      end
    end
  end
end
