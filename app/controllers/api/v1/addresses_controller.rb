module Api
  module V1
    class AddressesController < BaseController
      def index
        @addresses = LbAddressStreet.dubna(only_exists: false)
        if v = params[:query].presence
          @addresses = @addresses.like_name("%#{v.downcase}%")
        end
      end

      def houses
        street_id = params[:street_id] if params[:street_id]
        street = LbAddressStreet.dubna(only_exists: false).by_name(params[:street]).first if params[:street]
        street_id = street.record_id if street

        @addresses = (street_id) ? LbAddressBuilding.dubna(only_exists: false).by_street(street_id) : []
        if v = params[:query].presence
          @addresses = @addresses.like_name("%#{v.downcase}%")
        end
        @addresses = @addresses.sort_by{|a| a.name.to_i}
      end

      def flats
        building_id = params[:building_id]
        flats = LbAddressFlat.by_building(building_id).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct
        flats = flats.sort_by{|a| a.name.to_i}
        render json: flats.map.with_index{|s, idx| { flat_id: s.record_id, name: s.name, short: s.short }}
      end

      def entrances
        building_id = params[:building_id]
        entrances = LbAddressEntrance.by_building(building_id).order('name ASC').distinct
        entrances = entrances.sort_by{|a| a.name.to_i}

        render json: entrances.map.with_index{|s, idx| { entrance_id: s.record_id, name: s.name, short: s.short }}
      end
    end
  end
end
