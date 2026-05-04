module Site
  module V4
    class DevicesController < ::Site::V4::BaseController

      skip_before_action :authenticate_abonent
      before_action :set_device, only: [:show, :update]

      def show
      end

      def create
        @device = PhoneDevice.find_or_initialize_by(device_token: device_params[:device_token])
        @device.update(device_params)
      end

      def update
        @device.update(device_params)
      end

      private

        def device_params
          q = if params[:device].present?
            params.require(:device).permit(:device_token, :platform, :user_id, :permission_infos, :permission_bills, :permission_lotto)
          else
            params.permit(:device_token, :platform, :user_id, :permission_infos, :permission_bills, :permission_lotto)
          end
          if q.has_key?(:user_id)
            q[:abonent_id] = q[:user_id]
            q.delete(:user_id)
          end
          q
        end

        def set_device
          @device = PhoneDevice.find_by(device_token: params[:device_token])
        end

    end
  end
end
