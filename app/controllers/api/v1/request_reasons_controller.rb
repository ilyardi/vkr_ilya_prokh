module Api
  module V1
    class RequestReasonsController < BaseController
      def index
        request_type_id = params[:request_type_id]
        @request_reasons = RequestReason.all
        @request_first_reasons = RequestFirstReason.active
        if request_type_id.present?
          # @request_reasons = @request_reasons.where(request_type_id: request_type_id)
          @request_first_reasons = @request_first_reasons.where(request_type_id: request_type_id)
        end
        @request_reasons = @request_reasons.order(service_type: :asc, service_location: :desc)
      end

      def create
        @request_reason = RequestReason.create(request_reason_params)
        set_bad_request(@request_reason)
      end

      def update
        @request_reason = RequestReason.find(params[:id])
        @request_reason.update(request_reason_params) if @request_reason.present?
        set_bad_request(@request_reason)
      end

      def destroy
        request_reason = RequestReason.find(params[:id]).destroy
        render json: {success: true}
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def request_reason_params
        params.require(:request_reason).permit(:description, :service_type, :service_location)
      end

    end
  end
end
