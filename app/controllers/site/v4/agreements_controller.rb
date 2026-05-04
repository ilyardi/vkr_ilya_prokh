module Site
  module V4
    class AgreementsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent, only: [:streets, :buildings]
      before_action :set_address, only: [:show, :default, :destroy, :payments]

      def index
        @addresses = current_abonent.dogovors.not_blocked
      end

      def default
        ActiveRecord::Base.transaction do
          current_abonent.dogovors.update_all(default: false)
          @address.update_column(:default, true)
        end
        render action: :show
      end

      def destroy
        ActiveRecord::Base.transaction do
          @address.destroy
          @addresses = current_abonent.dogovors.not_blocked
          @addresses.update_all(default: false)
          @addresses.first.update_column(:default, true) if @addresses.present? && @address.default
          render json: { success: true } and return
        end
        render json: { success: false }
      end

      def create
        confirmed = !!params[:confirmed]

        if confirmed
          @agreement = LbAgreement.search_by_login(confirmed_address_params[:login], confirmed_address_params[:password]).first
        else
          @agreement = LbAgreement.search_by_address_ids(address_params[:street_id], address_params[:building_id], address_params[:flat]).first
        end

        unless @agreement
          render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.not_found")]}}}
          return
        end

        @address = current_abonent.dogovors.find_or_initialize_by(agrm_id: @agreement.agrm_id)

        if @address.persisted?
          if @address.confirmed? || (!@address.confirmed? && !confirmed) || @address.blocked?
            render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.exist")]}}}
            return
          end
        end

        account_address = @agreement.lb_account.address_connect(as_hash: true)

        ActiveRecord::Base.transaction do
          current_abonent.dogovors.update_all(default: false)

          @address.assign_attributes({
            agrm_id: @agreement.agrm_id,
            confirmed: confirmed,
            default: true,
            street: account_address[:street],
            building: account_address[:building],
            flat: account_address[:flat],
          })
          unless @address.save
            raise ActiveRecord::Rollback
          end

          if confirmed
            LbTelesetAgreement.find_or_create_by(agrm_id: @agreement.agrm_id)
          end
        end
      end

      private

        def set_address
          @address = current_abonent.dogovors.not_blocked.find_by!(agrm_id: params[:id])
        end

        def address_params
          params.require(:address).permit(
            :street_id,
            :building_id,
            :flat,
          )
        end

        def confirmed_address_params
          params.require(:address).permit(
            :login,
            :password
          )
        end
    end
  end
end
