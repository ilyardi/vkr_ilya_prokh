module Lbwidget
  class AddressesController < BaseController

    def streets
      streets = LbAddressStreet.by_city(3994).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct

      render json: streets.map{|s| { street_id: s.record_id, name: "#{s.name} #{s.short}", short: s.short }}
    end

    def buildings
      street_id = params[:street_id]
      buildings = LbAddressBuilding.by_city(3994).by_street(street_id).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct

      render json: buildings.map{|s| { building_id: s.record_id, name: s.fullname, short: s.short }}
    end

    def flats
      building_id = params[:building_id]
      flats = LbAddressFlat.by_building(building_id).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct

      render json: flats.map.with_index{|s, idx| { flat_id: s.record_id, name: s.name, short: s.short }}
    end

    def accounts
      street_id   = params[:street_id]
      building_id = params[:building_id]
      flat_id     = params[:flat_id]

      accounts = LbAccount.joins(:lb_accounts_addrs).where(accounts: { archive: 0 }, accounts_addr: { type: 2, street: street_id, building: building_id, flat: flat_id })

      render json: accounts.map(&:to_call_params)
    end

  end
end
