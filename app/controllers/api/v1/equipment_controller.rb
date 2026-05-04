module Api
  module V1
    class EquipmentController < BaseController
      load_and_authorize_resource
      before_action :set_equipment, only: [:show, :destroy, :update]

      def show
      end

      def create
        ActiveRecord::Base.transaction do
          @equipment = Equipment.create(equipment_params)
          raise ActiveRecord::RecordInvalid if !@equipment.persisted?
          @location = EquipmentLocation.new(equipment_location_params)
          @location.changed_by = current_user.id
          @location.equipment = @equipment
          @location.save
          raise ActiveRecord::RecordInvalid if !@location.persisted?
        end

      rescue ActiveRecord::RecordInvalid
        render status: :unprocessable_entity
      end

      def index
        @order = params[:order] || "desc"
        @order_by = params[:order_by] || "created_at"
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 10).to_i
        @equipment = Equipment.includes(:equipment_locations, :equipment_type)

        @brands = @equipment.pluck(:brand).uniq
        @models = @equipment.pluck(:model).uniq
        @equipment_types = EquipmentType.select('DISTINCT name')
        @warehouses = Warehouse.all
        @users = User.engineer

        filter = params[:search] || {}

        @equipment = @equipment.joins(:equipment_locations, :equipment_type)
          .where("equipment_locations.created_at = (SELECT MAX(equipment_locations.created_at)
          FROM equipment_locations
          WHERE equipment_locations.equipment_id = equipment.id)"
        )
        @equipment = @equipment.where("equipment_locations.status = ?", filter[:status]) if filter[:status]
        @equipment = @equipment.where("equipment.identifier ILIKE ?", "%#{filter[:identifier]}%") if filter[:identifier]
        @equipment = @equipment.where("equipment.serial_number ILIKE ?", "%#{filter[:serial_number]}%") if filter[:serial_number]
        @equipment = @equipment.where("equipment.model = ?", filter[:model]) if filter[:model]
        @equipment = @equipment.where("equipment.brand = ?", filter[:brand]) if filter[:brand]
        @equipment = @equipment.where("equipment_types.name = ?", filter[:equipment_type]) if filter[:equipment_type]
        @equipment = @equipment.joins("
          LEFT OUTER JOIN warehouses
          ON warehouses.id = equipment_locations.location_id
          AND equipment_locations.location_type = 'Warehouse'
        ").joins("
          LEFT OUTER JOIN users
          ON users.id = equipment_locations.location_id
          AND equipment_locations.location_type = 'User'
        ").where("users.name = ? OR warehouses.name = ?", filter[:warehouse], filter[:warehouse]) if filter[:warehouse] && filter[:warehouse] != ""
        @equipment = @equipment.order("equipment.#{@order_by} #{@order}").page(@page).per(@per)
        @equipment = @equipment.where("equipment_locations.location_id = ?", filter[:lb_agreement].to_i) if filter[:lb_agreement] && filter[:lb_agreement] != ""
      end

      def update
        ActiveRecord::Base.transaction do
          @equipment.update(equipment_params)
          raise ActiveRecord::RecordInvalid if !@equipment.errors.messages.empty?
          @location = EquipmentLocation.new(equipment_location_params)

          if @location.status != @equipment.equipment_locations.first.status ||
            @location.location_id != @equipment.equipment_locations.first.location_id ||
            @location.coords["rack"] != @equipment.equipment_locations.first.coords["rack"] ||
            @location.coords["shelf"] != @equipment.equipment_locations.first.coords["shelf"]
            @location.changed_by = current_user.id
            @location.equipment = @equipment
            @location.save
            raise ActiveRecord::RecordInvalid if !@location.errors.messages.empty?
          end
        end

      rescue ActiveRecord::RecordInvalid
        render status: :unprocessable_entity
      end

      def destroy
        @equipment.destroy
        render json: {success: true}
      end

      def brands
        @brands = Equipment.pluck(:brand).uniq
        @models = Equipment.pluck(:model).uniq
      end

      private

      def set_equipment
        @equipment = Equipment.find(params[:id])
      end

      def equipment_params
        params.require(:equipment).permit(:identifier, :model, :brand, :serial_number, :equipment_type_id, :comment)
      end

      def equipment_location_params
        params.require(:equipment).permit(:status, :location_id, :location_type, coords: [:rack, :shelf])
      end
    end
  end
end
