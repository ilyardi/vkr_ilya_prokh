module Api
  module V1
    class SupportRequestsController < BaseController
      load_and_authorize_resource

      def index
        @order = params[:order]
        @order_by = params[:order_by]
        @current = (params[:current]).to_i
        @page_size = (params[:page_size]).to_i
        filter = params[:search] || {}
        @support_requests = SupportRequest.order(@order_by => @order) if @order_by && @order
        @support_requests = @support_requests.page(@current).per(@page_size)
      end
    end
  end
end