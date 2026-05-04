module Api
    module V1
      class LbTarifsController < BaseController
        def index
          user = current_user
          @lb_tarifs = LbTarif.all
          @lb_tarifs = @lb_tarifs.where("descr LIKE ?", "%#{params[:filter]}%") if params[:filter].present?
        end
      end
    end
  end
