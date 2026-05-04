module Site
  module V1
    class DogovorsController < Site::V1::BaseController
      before_action :set_address, only: [:show, :default, :destroy, :payments]

      def index
        @addresses = current_abonent.dogovors.not_blocked
      end

      def create
        @agreement = LbAgreement.search_by_address_ids(address_params[:street], address_params[:building], address_params[:flat]).first
        unless @agreement
          render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.not_found")]}}}
          return
        end

        if current_abonent.dogovors.find_by(agrm_id: @agreement.agrm_id)
          render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.exist")]}}}
          return
        end

        account_address = @agreement.lb_account.address_connect(as_hash: true)

        ActiveRecord::Base.transaction do
          current_abonent.dogovors.update_all(default: false)
          address_attrs = {
            agrm_id: @agreement.agrm_id,
            default: true,
          }
          address_attrs.merge!(account_address)
          @address = current_abonent.dogovors.create(address_attrs)
        end
      end

      def create_confirmed
        @agreement = LbAgreement.search_by_login(confirmed_address_params[:login], confirmed_address_params[:password]).first
        unless @agreement
          render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.not_found")]}}}
          return
        end

        if current_abonent.dogovors.confirmed.find_by(agrm_id: @agreement.agrm_id)
          render json: {validation: {address: {base: [I18n.t("site.v1.addresses_controller.create.exist")]}}}
          return
        end

        account_address = @agreement.lb_account.address_connect(as_hash: true)

        ActiveRecord::Base.transaction do
          current_abonent.dogovors.update_all(default: false)
          address_attrs = {
            confirmed: true,
            default: true,
          }
          address_attrs.merge!(account_address)
          @address = current_abonent.dogovors.find_or_initialize_by(agrm_id: @agreement.agrm_id)
          unless @address.update(address_attrs)
            render json: {validation: {address: @address.errors}}
            raise ActiveRecord::Rollback
          end

          LbTelesetAgreement.find_or_create_by(agrm_id: @agreement.agrm_id)
        end
      end

      def show
      end

      def destroy
        ActiveRecord::Base.transaction do
          @address.destroy
          @addresses = current_abonent.dogovors
          @addresses.update_all(default: false)
          @addresses.first.update_column(:default, true) if @addresses.present? && @address.default
        end
      end

      def default
        ActiveRecord::Base.transaction do
          current_abonent.dogovors.update_all(default: false)
          @address.update_column(:default, true)
        end
      end

      def payments
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 20).to_i
        @payments = if @address.confirmed
          LbPayment.confirmed.where(agrm_id: @address.agrm_id).order('pay_date DESC').page(@page).per(@per)
        else
          {}
        end
      end

      private

        def set_address
          @address = current_abonent.dogovors.not_blocked.find(params[:id])
        end

        def address_params
          params.require(:address).permit(
            :street,
            :building,
            :flat,
            :confirmed,
            :default,
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
