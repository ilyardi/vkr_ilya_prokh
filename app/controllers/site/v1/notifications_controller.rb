module Site
  module V1
    class NotificationsController < Site::V1::BaseController
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
        @notifications_unread_count = @notifications.created.count
        @notifications = @notifications.ordered.page(@page).per(@per)
      end

      def update
        @notification = Notification.find(params[:id])
        @notification.update(notification_params)
      end

      def mark_all_as_read
        @notifications = Notification.none
        if current_abonent
          @notifications = @notifications.or(Notification.where(recipient: current_abonent))
        end
        if params[:device_token].present? && pd = PhoneDevice.find_by(device_token: params[:device_token])
          @notifications = @notifications.or(Notification.where(recipient: pd))
        end
        @notifications.update(status: :readed)

        render json: { success: true }
      end

      private

        def notification_params
          params.require(:notification).permit(:status)
        end

    end
  end
end
