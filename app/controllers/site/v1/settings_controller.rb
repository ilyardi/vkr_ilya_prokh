module Site
  module V1
    class SettingsController < Site::V1::BaseController
      skip_before_action :authenticate_abonent

      def video_instruction_url
        @url = "https://videos-b9848f7c.cdn.integros.com/videos/frm9W5suS9tQbGGB4g9nUi/mp4/720.mp4"
      end
    end
  end
end
