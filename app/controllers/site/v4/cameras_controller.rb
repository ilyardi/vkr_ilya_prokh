module Site
  module V4
    class CamerasController < ::Site::V4::BaseController
      skip_before_action :authenticate_abonent

      def index
        @cameras = Camera.ordered.active.free
        @user_cameras = Camera.none
        @business_cameras = Camera.none

        if current_abonent
          current_abonent.dogovors.confirmed.not_blocked.each do |a|
            next if Debtor.current_debtor?(agrm_id:a.agrm_id)
            @user_cameras = @user_cameras.or(Camera.active.by_address(a.street, a.building))
            @business_cameras = @business_cameras.or(Camera.active.by_agrm(a.agrm_id))
          end
          @user_cameras = @user_cameras.order(:created_at).uniq
          @business_cameras = @business_cameras.order(:created_at).uniq
        end
      end

    end
  end
end
