module Api
  module V1
    class RequestStatusesController < BaseController
      def index
        request_type_id = params[:request_type_id]
        @request_statuses = RequestStatus.all
        @request_statuses = @request_statuses.where(request_type_id: request_type_id) if request_type_id
        @request_statuses = @request_statuses.order(:priority => :asc)
      end

      def for_searching
        @request_statuses = RequestStatus.active.pluck(:name).uniq
        render json: {request_statuses: @request_statuses}
      end

      def create
        @request_status = RequestStatus.create(request_status_params)
        set_bad_request(@request_status)
      end

      def destroy
        request_status = RequestStatus.find(params[:id]).destroy
        render json: {success: true}
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def request_status_params
        params.require(:request_status).permit(:name, :alert_timer, :request_type_id, :priority, :after_finish)
      end
    end
  end
end
