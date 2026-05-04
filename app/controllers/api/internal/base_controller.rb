module Api
  module Internal
    class BaseController < ::ActionController::API
      include ActionController::MimeResponds

      before_action :authenticate_admin!
      respond_to :json

      protected

        def page
          @page = (params[:page].presence || 1).to_i
        end

        def per_page(default = 20)
          @per_page = (params[:per].presence || default).to_i
        end

        def authenticate_admin!
          return if Rails.env.development?
          key = params[:access_key] || request.headers["X-ACCESS-KEY"]
          unless key.present? && key == ENV["API_ACCESS_KEY"]
            render json: { error: 'Unauthorized' }, status: :forbidden
          end
        end

    end
  end
end
