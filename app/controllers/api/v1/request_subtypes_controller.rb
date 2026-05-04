module Api
  module V1
    class RequestSubtypesController < BaseController
      def index
        request_type_id = params[:request_type_id]
        @request_subtypes = RequestSubtype.all
        @request_subtypes = @request_subtypes.where(request_type_id: request_type_id) if request_type_id
        @request_subtypes = @request_subtypes.order(:name => :asc)
      end

      def create
        @request_subtype = RequestSubtype.create(request_subtype_params)
        set_bad_request(@request_subtype)
      end

      def destroy
        request_subtype = RequestSubtype.find(params[:id]).destroy
        render json: {success: true}
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def request_subtype_params
        params.require(:request_subtype).permit(:name, :request_type_id)
      end
    end
  end
end