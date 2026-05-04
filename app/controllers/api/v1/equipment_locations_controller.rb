module Api
  module V1
    class EquipmentLocationsController < BaseController
      def index
        @order = params[:order] || "desc"
        @order_by = params[:order_by] || "created_at"
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 10).to_i
        eqipment_id = params[:equipment_id]
        @equipment_locations = EquipmentLocation.where(equipment_id: eqipment_id).order("#{@order_by} #{@order}").page(@page).per(@per)
      end
    end
  end
end
