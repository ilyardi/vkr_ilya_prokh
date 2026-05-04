module Api
  module V1
    class BlockingServicesController < BaseController
      def index
        filter = params[:filter] || {}

        street_id = filter[:street_id] || nil
        building_id = filter[:building_id] || nil
        entrance_id = filter[:entrance_id] || nil
        flat_id = filter[:flat_id] || nil

        agrm_ids = []
        search_by_lb_agrm = street_id.present? || filter[:name].present? || filter[:phone].present? || filter[:number].present?

        if search_by_lb_agrm
          agreements = LbAgreement.joins(lb_account: :lb_accounts_addrs)
                                .where("accounts_addr.type=2 AND accounts.archive = 0 AND agreements.archive = 0")
          agreements = agreements.where("accounts.mobile LIKE ? OR accounts.phone LIKE ? OR accounts.fax LIKE ?","%#{filter[:phone]}%","%#{filter[:phone]}%","%#{filter[:phone]}%") if filter[:phone].present?
          agreements = agreements.where("agreements.number LIKE ?","%#{filter[:number]}%") if filter[:number].present?
          agreements = agreements.where("accounts.name LIKE ?","%#{filter[:name]}%") if filter[:name].present?
          agreements = agreements.where('accounts_addr.street = ?', street_id) if street_id.present?
          agreements = agreements.where("accounts_addr.building = ?", building_id) if building_id.present?
          agreements = agreements.where("accounts_addr.flat = ?", flat_id) if flat_id.present?
          agreements = agreements.where("accounts_addr.entrance = ?", entrance_id) if entrance_id.present?
          agrm_ids = agreements.pluck('agreements.agrm_id')
        end

        @blocking_services = BlockingService.includes(:abonent,lb_agreement: [:lb_account]).all
        @blocking_services = @blocking_services.where("blocking_services.agrm_id in (?)", agrm_ids) if search_by_lb_agrm
        @blocking_services = @blocking_services.where("blocking_services.active = true") if filter[:active].present?
        @blocking_services = @blocking_services.where("CAST(blocking_services.id AS text) LIKE ?", filter[:blocking_number]) if filter[:blocking_number].present?
        @blocking_services = @blocking_services.where("blocking_services.status = ?", filter[:status]) if filter[:status].present?
        @blocking_services = @blocking_services.where("abonents.phone LIKE ?", filter[:lk_phone]) if filter[:lk_phone].present?
        @blocking_services = @blocking_services.page(page_param).per(per_param)
      end

      def create
      end

      def show
        @blocking_service = BlockingService.find(params[:id])
      end

      def update
        @blocking_service = BlockingService.find(params[:id])
        @blocking_service.update(blocking_service_params)
      end

      private

      def blocking_service_params
        params.require(:blocking_service).permit(:agrm_id, :from_date, :to_date, :status, :active, :abonent_id)
      end
    end
  end
end
