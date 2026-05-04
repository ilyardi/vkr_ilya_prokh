module Site
  module V4
    class AddressesController < Site::V4::BaseController
      skip_before_action :authenticate_abonent, only: [:streets, :buildings]

      def streets
        @addresses = LbAddressStreet.dubna
        if v = params[:query].presence
          @addresses = @addresses.where('address_street.name LIKE ?', "%#{v.downcase}%")
        end
      end

      def buildings
        @addresses = LbAddressBuilding.dubna.by_street(params[:street_id])
        if v = params[:query].presence
          @addresses = @addresses.where('address_building.name LIKE ?', "%#{v.downcase}%")
        end
      end
    end
  end
end
