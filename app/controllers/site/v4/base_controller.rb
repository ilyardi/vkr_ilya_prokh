module Site
  module V4
    class BaseController < ActionController::API
      include ActionController::Cookies

      before_action :authenticate_abonent

      helper_method :current_abonent

      private

        def current_abonent
          @current_abonent ||= session[:abonent_id] && Abonent.find_by(id: session[:abonent_id])
        end

        def authenticate_abonent
          render json: { error: I18n.t('site.v4.base.unauthorized') }, status: 401 unless current_abonent
        end
    end
  end
end
