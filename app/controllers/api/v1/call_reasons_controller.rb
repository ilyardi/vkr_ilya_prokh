module Api
  module V1
    class CallReasonsController < BaseController

      def index
        @call_reasons = CallReason.all
      end

      def update
        @call_reason = CallReason.find(params[:id])
        @call_reason.update(call_reason_params)
      end

      protected

        def call_reason_params
          params.require(:call_reason).permit(:name, :active, :position, :group)
        end
    end
  end
end
