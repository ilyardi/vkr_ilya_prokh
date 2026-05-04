module Api
  module V1
    class BaseController < ::ActionController::API
      include ActionController::MimeResponds
      include CanCan::ControllerAdditions

      before_action :authenticate_user!
      before_action :set_paper_trail_whodunnit
      
      respond_to :json

      helper_method :page_param
      helper_method :per_param

      rescue_from CanCan::AccessDenied do |exception|
        respond_to do |format|
          format.json { head :forbidden, content_type: 'text/html' }
          format.html { redirect_to main_app.root_url, notice: exception.message }
          format.js   { head :forbidden, content_type: 'text/html' }
        end
      end

      private
        def page_param
          @page ||= (params[:page].presence || 1).to_i
        end

        def per_param(default = 50)
          @per ||= (params[:per].presence || default).to_i
        end

    end
  end
end
