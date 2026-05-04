module Api
  module V1
    class TeledomRequestsController < BaseController
      def index
        filter = params[:search] || {}

        street_id = filter[:street_id] || nil
        building_id = filter[:building_id] || nil
        entrance_id = filter[:entrance_id] || nil
        flat_id = filter[:flat_id] || nil

        agrm_ids = []
        search_by_lb_agrm = street_id.present? || filter[:name].present? || filter[:number].present?

        if search_by_lb_agrm
          agreements = LbAgreement.joins(lb_account: :lb_accounts_addrs)
                                .where("accounts_addr.type=2 AND accounts.archive = 0 AND agreements.archive = 0")
          # agreements = agreements.where("accounts.mobile LIKE ? OR accounts.phone LIKE ? OR accounts.fax LIKE ?","%#{filter[:phone]}%","%#{filter[:phone]}%","%#{filter[:phone]}%") if filter[:phone].present?
          agreements = agreements.where("agreements.number LIKE ?","%#{filter[:agrm_number]}%") if filter[:agrm_number].present?
          agreements = agreements.where("accounts.name LIKE ?","%#{filter[:name]}%") if filter[:name].present?
          agreements = agreements.where('accounts_addr.street = ?', street_id) if street_id.present?
          agreements = agreements.where("accounts_addr.building = ?", building_id) if building_id.present?
          agreements = agreements.where("accounts_addr.flat = ?", flat_id) if flat_id.present?
          agreements = agreements.where("accounts_addr.entrance = ?", entrance_id) if entrance_id.present?
          agrm_ids = agreements.pluck('agreements.agrm_id')
        end

        @teledom_requests = TeledomRequest.includes(lb_agreement: [:lb_account]).all
        @teledom_requests = @teledom_requests.where("teledom_requests.agrm_id in (?)", agrm_ids) if search_by_lb_agrm
        @teledom_requests = @teledom_requests.where("CAST(teledom_requests.id AS text) LIKE ?", filter[:number]) if filter[:number].present?
        @teledom_requests = @teledom_requests.where("teledom_requests.status = ?", filter[:status]) if filter[:status].present?
        @teledom_requests = @teledom_requests.where("teledom_requests.phone LIKE ?", "%#{filter[:phone]}%") if filter[:phone].present?
        @teledom_requests = @teledom_requests.page(page_param).per(per_param)
      end

      def create
      end

      def show
        @teledom_request = TeledomRequest.find(params[:id])
      end

      def update
        @teledom_request = TeledomRequest.find(params[:id])
        @teledom_request.update(teledom_request_params)
      end

      private

      def teledom_request_params
        params.require(:teledom_request).permit(:agrm_id, :status, :description, :subject, :user_id)
      end
    end
  end
end
