module Api
    module V1
      class LbDevicesController < BaseController
        def index
          filter = params.fetch(:filter, {})

          @lb_devices = LbDevice.left_outer_joins(:lb_address_street, :lb_address_building, :lb_address_entrance)
          # @lb_devices = @lb_devices.where("devices.device_name LIKE ?", "%#{search_params[:device_name]}%") if search_params[:device_name].present?
          @lb_devices = @lb_devices.where("address_street.name = ?", filter[:street]) if filter[:street].present?
          @lb_devices = @lb_devices.where("address_building.record_id = ?", filter[:building]) if filter[:building].present?
          @lb_devices = @lb_devices.where("address_entrance.name = ?", filter[:entrance]) if filter[:entrance].present?

          @lb_devices = @lb_devices.page(1).per(20)
        end


        # def search
        #     @lb_devices = LbDevice.limit(20)
        #     isSearch = false
    
        #     search_params.to_h.each do |k,v|
        #       isSearch = true if v.presence
        #     end
    
        #     if isSearch
        #       @lb_devices = LbDevice.joins(:lb_address_street, :lb_address_building, :lb_address_entrance)
        #       # @lb_devices = @lb_devices.where("devices.device_name LIKE ?", "%#{search_params[:device_name]}%") if search_params[:device_name].present?
        #       @lb_devices = @lb_devices.where("address_street.name = ?", search_params[:street]) if search_params[:street].present?
        #       @lb_devices = @lb_devices.where("address_building.record_id = ?", search_params[:building]) if search_params[:building].present?
        #       @lb_devices = @lb_devices.where("address_entrance.name = ?", search_params[:entrance]) if search_params[:entrance].present?
        #     end
        # end

      end
    end
  end
  