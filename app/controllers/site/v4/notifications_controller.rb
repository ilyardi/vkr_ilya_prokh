module Site
  module V4
    class NotificationsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent

      def index
        @page = params[:page] || 1
        @per = params[:per] || 30
        @notifications = Notification.none
        if current_abonent
          @notifications = @notifications.or(Notification.where(recipient: current_abonent))
        end
        if params[:device_token].present? && pd = PhoneDevice.find_by(device_token: params[:device_token])
          @notifications = @notifications.or(Notification.where(recipient: pd))
        end
        @notifications_total_count = @notifications.count
        @notifications_unread_count = @notifications.created.count
        @notifications = @notifications.ordered.page(@page).per(@per)
      end

      def update
        @notification = Notification.find(params[:id])
        @notification.update(notification_params)
      end

      private

      def notification_params
        params.require(:notification).permit(:status)
      end
    end
  end
end
