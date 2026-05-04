module Site
  module V1
    class CamerasController < Site::V1::BaseController
      def index
        @cameras = Camera.ordered.active.free
        @abonent_cameras = Camera.none
        @business_cameras = Camera.none

        if current_abonent
          current_abonent.dogovors.confirmed.not_blocked.each do |a|
            next if Debtor.current_debtor?(agrm_id:a.agrm_id)
            @abonent_cameras = @abonent_cameras.or(Camera.active.by_address(a.street, a.building))
            @business_cameras = @business_cameras.or(Camera.active.by_agrm(a.agrm_id))
          end
          @abonent_cameras = @abonent_cameras.order(:created_at).uniq
          @business_cameras = @business_cameras.order(:created_at).uniq
        end
      end

      def board
        @cameras = CamerasBoard.includes(:camera).where(abonent_id: current_abonent.id).ordered.map(&:camera)
      end

    end
  end
end

