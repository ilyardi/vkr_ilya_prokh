module Lbwidget
  class CallsController < BaseController

    def create
      @call = lb_manager.calls.create(call_params)

      if @call.errors.empty?
        render json: { success: true, call: @call }
      else
        render json: { success: false, errors: @call.errors.to_hash }
      end
    end

    protected

      def call_params
        params.require(:call).permit(:lb_account_id, :call_reason_id)
      end

  end
end
