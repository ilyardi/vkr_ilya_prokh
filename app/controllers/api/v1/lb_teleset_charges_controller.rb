module Api
  module V1
    class LbTelesetChargesController < BaseController
      load_and_authorize_resource

      def index
        filter = params[:filter] || {}
        @order_by = (params[:order_by].presence || "month")
        @order = (params[:order].presence || "desc")

        @lb_teleset_charges = LbTelesetCharge.all
        @lb_teleset_charges = @lb_teleset_charges.where("teleset_charges.agrm_id = ?", filter[:agrm_id]) if filter[:agrm_id]
        @lb_teleset_charges = @lb_teleset_charges.where("teleset_charges.month = ?", (Date.parse(filter[:month]) rescue Date.today - 1.month).beginning_of_month) if filter[:month]
        @lb_teleset_charges = @lb_teleset_charges.order(@order_by => @order).page(page_param).per(per_param)
      end

      private

    end
  end
end