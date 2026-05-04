module Api
  module V1
    class EquipmentTypesController < BaseController
      load_and_authorize_resource
      before_action :set_equipment_type, only: [:show, :update, :destroy]

      def create
        @equipment_type = EquipmentType.new(equipment_type_params)
        render status: @equipment_type.save ? :ok : :unprocessable_entity
      end

      def show
      end

      def update
        render status: @equipment_type.update(equipment_type_params) ? :ok : :unprocessable_entity
      end

      def destroy
        @equipment_type.destroy
        render json: {success: true}
      end

      def index
        @order = params[:order] || "desc"
        @order_by = params[:order_by] || "created_at"
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 10).to_i

        @equipment_types = EquipmentType.order("#{@order_by} #{@order}").page(@page).per(@per)
      end

      private

      def equipment_type_params
        params.require(:equipment_type).permit(:name)
      end

      def set_equipment_type
        @equipment_type = EquipmentType.find(params[:id])
      end
    end
  end
end
