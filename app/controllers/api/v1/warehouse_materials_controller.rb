module Api
  module V1
    class WarehouseMaterialsController < BaseController
      load_and_authorize_resource

      def index
        @order = params[:order]
        @order_by = params[:order_by]
        @current = (params[:current]).to_i
        @page_size = (params[:page_size]).to_i
        show_out_of_stock = ActiveModel::Type::Boolean.new.cast(params[:show_out_of_stock]) 
        filter = params[:search] || {}

        unless show_out_of_stock
          @warehouse_materials = @warehouse_materials.where("warehouse_materials.quantity > 0")
        end 
        @warehouse_materials = @warehouse_materials.where("warehouse_materials.name ILIKE ?", "%#{filter[:name]}%") if filter[:name]
        @warehouse_materials = @warehouse_materials.where("warehouse_materials.warehouse_material_category_id = ?", filter[:category]) if filter[:category]
        @warehouse_materials = @warehouse_materials.order(@order_by => @order) if @order_by && @order
        @warehouse_materials = @warehouse_materials.page(@current).per(@page_size)
      end

      def show
        @warehouse_material = WarehouseMaterial.find(params[:id])
      end

      def getunit
        @units = WarehouseMaterial.units
      end

      def create
        
        @warehouse_material = WarehouseMaterial.create(material_params)
        set_bad_request(@warehouse_material)
        
      end

      def update
        @warehouse_material = WarehouseMaterial.find(params[:id])
        @warehouse_material.update(material_params)
        set_bad_request(@warehouse_material)
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def material_params
        params.require(:material).permit(:name, :code, :unit, :warehouse_material_category_id, :quantity, coords: [:rack, :shelf])
      end

    end
  end
end
