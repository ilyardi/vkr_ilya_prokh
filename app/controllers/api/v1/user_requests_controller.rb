module Api
    module V1
      class UserRequestsController < BaseController
        load_and_authorize_resource
  
        def index
          @order = params[:order]
          @order_by = params[:order_by]
          @current = (params[:current]).to_i
          @page_size = (params[:page_size]).to_i
          filter = params[:search] || {}
          @user_requests = UserRequest.order(@order_by => @order) if @order_by && @order
          @user_requests = @user_requests.page(@current).per(@page_size)
        end
      end
    end
  end