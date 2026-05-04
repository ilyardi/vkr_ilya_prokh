module Api
  module V1
    class PortsController < BaseController
      load_and_authorize_resource

      def update
        @port = Port.find(params[:id])
        @port.change_port_state(params[:state]) if params[:state].present?
        set_bad_request(@port)
      end

      def check_port_state
        @port = Port.find(params[:id])
        @port.check_port_state
        set_bad_request(@port)
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
