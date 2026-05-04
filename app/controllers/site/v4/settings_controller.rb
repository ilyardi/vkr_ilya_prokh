module Site
  module V4
    class SettingsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent

      def show
        part = PagePart.where(name: params[:id]).first
        if part
          respond_to do |format|
            format.json { render json: ActiveSupport::JSON.decode(CGI.unescapeHTML(part.content)) }
            format.html { render text: part.content }
          end
          return
        end
        render nothing: true
      end

      def video_instruction_url
        url = "https://kinescopecdn.net/9a4fd1ea-c231-40a7-93ff-978f90600868/videos/eea4b142-a727-4745-bb11-92c44291f10e/mp4/720p.mp4"
        render json: { url: url }
      end
    end
  end
end

# https://kinescope.io/200557515/master.m3u8
