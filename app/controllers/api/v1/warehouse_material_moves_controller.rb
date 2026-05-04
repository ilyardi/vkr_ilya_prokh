module Api
  module V1
    class WarehouseMaterialMovesController < BaseController
      load_and_authorize_resource

      def index
        @order = params[:order]
        @order_by = params[:order_by]
        @current = (params[:current]).to_i
        @page_size = (params[:page_size]).to_i
        filter = params[:search] || {}
        @warehouse_material_moves = @warehouse_material_moves.joins(:warehouse_material, :user, :created_by)
        @warehouse_material_moves = @warehouse_material_moves.where("warehouse_material_moves.warehouse_material_id = ?",filter[:material_id]) if filter[:material_id]
        @warehouse_material_moves = @warehouse_material_moves.where("warehouse_material_moves.operation_type = ?",filter[:operation_type]) if filter[:operation_type]
        @warehouse_material_moves = @warehouse_material_moves.where(created_at: filter[:time_range][:start]..filter[:time_range][:end]) if filter[:time_range]
        @warehouse_material_moves = @warehouse_material_moves.where("warehouse_material_moves.user_id = ?",filter[:user]) if filter[:user]
        @warehouse_material_moves = @warehouse_material_moves.where("warehouse_material_moves.created_by_id = ?",filter[:created_by]) if filter[:created_by]
        @warehouse_material_moves = @warehouse_material_moves.where("warehouse_materials.name ILIKE ?", "%#{filter[:warehouse_material]}%") if filter[:warehouse_material]
        @warehouse_material_moves = @warehouse_material_moves.order(@order_by => @order).page(@current).per(@page_size)
      end

      def create
        @has_errors = false
        @errors_array = []
        @moves = []
        @data_moves = moves_params
        WarehouseMaterialMove.transaction do
          @data_moves[:moves].each do |move_params|
            move = WarehouseMaterialMove.new(move_params)
            move[:operation_type] = @data_moves[:operation_type]
            if @data_moves[:operation_type] == 1
              move[:user_id] = current_user.id
            else
              move[:user_id] = @data_moves[:user_id]
            end
            move[:created_by_id] = current_user.id
            move.save
            @moves << move
            unless move.persisted?
              @has_errors = true
            end
          end
          if @has_errors
            raise ActiveRecord::Rollback
          end
        end
      end

      private

      def moves_params
        params.require(:material_invoice).permit(:user_id, :operation_type, moves: [:warehouse_material_id, :quantity])
      end

    end
  end
end

