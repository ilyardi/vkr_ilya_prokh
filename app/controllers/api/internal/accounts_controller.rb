module Api
  module Internal
    class AccountsController < BaseController

      def streets
        streets = LbAddressStreet.by_city(3994).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct
        render json: streets.map{|s| { record_id: s.record_id, name: s.name, short: s.short }}
      end

      def buildings
        street_id = params[:street_id]
        buildings = LbAddressBuilding.by_city(3994).by_street(street_id).joins(lb_accounts_addrs: :lb_account).where(accounts: { archive: 0 }, accounts_addr: { type: 2 }).order('name ASC').distinct
        render json: buildings.map{|s| { record_id: s.record_id, name: s.fullname, short: s.short }}
      end

      def find_by_address
        street_id = params[:street_id]
        building_id = params[:building_id]

        street = params[:street]
        building = params[:building]

        flat = params[:flat]

        agreement = if street_id.present? && building_id.present?
          LbAgreement.joins(lb_account: {lb_accounts_addrs: :lb_address_flat}).
            find_by!('accounts_addr.street = ?
              AND accounts_addr.building = ?
              AND address_flat.name = ?
              AND accounts_addr.type=2
              AND accounts.archive = 0', street_id, building_id, flat)
        else
          LbAgreement.joins(lb_account: {lb_accounts_addrs: [:lb_address_flat, :lb_address_street, :lb_address_building]}).
            find_by!('address_street.name = ?
              AND address_building.name = ?
              AND address_flat.name = ?
              AND accounts_addr.type=2
              AND accounts.archive = 0', street, building, flat)
        end

        @account = agreement.lb_account
        @agreements = @account.lb_agreements.where(archive: 0, state: 0)
        render action: :show
      end

      def find_by_login
        @account = LbAccount.find_by!(login: params[:login], pass: params[:password], archive: 0)
        @agreements = @account.lb_agreements.where(archive: 0, state: 0)
        render action: :show
      end

      def update_by_agrm
        agrm = LbAgreement.find_by_agrm_id(params[:agrm_id])
        @account = agrm.lb_account
        @account.update(
          email: [
            @account.email.presence,
            @account.email&.include?(params[:email]) ? nil : params[:email]
          ].compact.uniq.join(","),
          fax: params[:phone]
        )
        render action: :show
      end

      # def export
      #   sql = <<-SQL
      #     SELECT a.uid, ag.agrm_id, ag.number as agrm_number, a.login, a.pass,
      #     a.name, round(ag.balance,2) as balance,
      #     address_format(2, ag.uid, '%S') as street,
      #     address_format(2, ag.uid, '%B') as building,
      #     address_format(2, ag.uid, '%F') as flat
      #     FROM agreements ag
      #     LEFT JOIN accounts a ON ag.uid = a.uid
      #     WHERE ag.archive = 0
      #       AND ag.number IS NOT NULL
      #       AND address_format(2, ag.uid, '%F') IS NOT NULL
      #       AND address_format(2, ag.uid, '%B') IS NOT NULL
      #   SQL
      #   render json: LbAccount.connection.exec_query(sql).to_a
      # end

    end
  end
end
