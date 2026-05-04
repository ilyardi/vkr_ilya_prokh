module Site
  class CamerasController < Site::BaseController
    before_action :fetch_camera
    before_action :check_auth

    def show
      server = 'cameras'
      case @camera.server_id
      when 1
        server = 'cameras'
      when 2
        server = 'cameras2'
      end

      index = "index.m3u8"
      if time = params[:time]
        index = "index-#{time}-#{get_interval(24*60*60)}.m3u8"
      end

      m3u8 = "https://#{server}.teleset.plus/#{@camera.token}/#{index}"

      if token = generate_camera_token
        m3u8 += "?token=#{token}"
      end

      respond_to do |format|
        format.m3u8 { redirect_to m3u8 }
        format.json { render json: { hls: m3u8 } }
      end
    end

    def archive
      unless @camera.is_archive?
        redirect_to("#{Settings.site_host}/404")
        return
      end

      server = 'cameras'
      case @camera.server_id
      when 1
        server = 'cameras'
      when 2
        server = 'cameras2'
      end

      url = "https://#{server}.teleset.plus/#{@camera.token}/embed.html?dvr=true"
      if token = generate_camera_token
        url += "&token=#{token}"
      end

      redirect_to url
    end

    # def manifest
    #   m3u8 = "https://cameras.teleset.plus/#{@camera.token}/index.m3u8"
    #   if time = params[:time]
    #     camera_status = get_camera_status
    #     if camera_status && time.to_i < camera_status["from"].to_i
    #       time = camera_status["from"].to_i
    #     end
    #     m3u8 = "https://cameras.teleset.plus/#{@camera.token}/index-#{time}-#{get_interval(24*60*60)}.m3u8"
    #   end
    #   if token = get_camera_token
    #     m3u8 += "?token=#{token}"
    #   end
    #   render json: { hls: m3u8 }
    # end

    # def screenshot
    #   # https://cameras.teleset.plus/cam_lesnay2_camera6/2020/03/03/17/57/11-preview.mp4?token=
    #   # https://cameras.teleset.plus/cam_lesnay2_camera6/preview.mp4
    #   url = "https://cameras.teleset.plus/#{@camera.token}/preview.mp4"
    #   if params[:time] && t = Time.at(params[:time].to_i)
    #     url = "https://cameras.teleset.plus/#{@camera.token}/#{t.strftime('%Y/%m/%d/%H/%M/%S')}-preview.mp4"
    #   end
    #   if token = get_camera_token
    #     url += "?token=#{token}"
    #   end

    #   redirect_to url
    #   # Rails.logger.ap url
    #   # r = Faraday.get url
    #   # send_data r.body, type: r.headers['content-type'], disposition: 'inline'
    # end

    # def download
    #   if current_user.nil? && current_employee.nil?
    #     render json: { error: I18n.t('api.v3.base.unauthorized') }, status: 401 and return
    #   end

    #   # unless @camera.server_type == 'flussonic'
    #   #   render(status: :not_found, json: { error: 'Not found' }) and return
    #   # end

    #   unless params[:time]
    #     render(status: :not_found, json: { error: 'Time is empty' }) and return
    #   end

    #   # unless @camera.is_archive?
    #   #   render(status: :not_found, json: { error: 'Not found' }) and return
    #   # end

    #   time = Time.at(params[:time].to_i)
    #   if time < (Time.now - 5.day) || time > (Time.now + 1.minutes)
    #     render(status: :not_found, json: { error: 'Not found' }) and return
    #   end

    #   camera_status = get_camera_status
    #   if camera_status && time.to_i < camera_status["from"].to_i
    #     time = camera_status["from"].to_i
    #   end

    #   interval = get_interval(3600)

    #   url = "https://cameras.teleset.plus/#{@camera.token}/archive-#{time.to_i}-#{interval}.mp4"
    #   if token = get_camera_token
    #     url += "?token=#{token}"
    #   end

    #   CameraLog.create(user: current_user || current_employee, action: 'download', data: {
    #     referrer: request.referrer,
    #     ip: remote_ip,
    #     token: @camera.token,
    #     time: time.to_i,
    #     interval: interval,
    #   })

    #   redirect_to url
    # end

    # # https://cameras.teleset.plus/cam_9may_1_camera1/recording_status.json?from=1582819201&to=1583259330&request=motion_log,ranges&token=166ce9a33d8890d8779ac14c7840d3a4c3a89f8f-17713622-1583260461-158325656
    # def status
    #   url = "https://cameras.teleset.plus/#{@camera.token}/recording_status.json?request=ranges"
    #   if v = params[:from].presence
    #     url += "&from=#{v}"
    #   end
    #   if v = params[:to].presence
    #     url += "&to=#{v}"
    #   end

    #   camera_status = Rails.cache.fetch url, expires_in: 5 * 60 do
    #     if token = get_camera_token
    #       url += "&token=#{token}"
    #     end

    #     resp = Faraday.get(url)

    #     body = if resp.status == 200
    #       JSON.parse(resp.body)
    #     else
    #       {}
    #     end
    #     body.is_a?(Hash) ? body[@camera.token] : body.first['ranges']
    #   end

    #   render json: camera_status
    # end

    private
      def fetch_camera
        camera_scope = Camera

        # Если залогинен в CRM, то можно смотреть даже не активную камеру
        if !current_user || !current_ability.can?(:read, Camera)
          camera_scope = camera_scope.active
        end

        @camera = camera_scope.find_by!(slug: params[:id])
      end

      def check_auth
        return if @camera.free?
        return if current_user && current_ability.can?(:read, Camera)

        if current_abonent.nil? || !current_abonent.can_view_camera?(@camera)
          render json: { error: I18n.t('api.base.forbidden') }, status: 403 and return
        end
      end

      # def check_thiefs
      #   Rails.logger.warn "[Camera##{params[:action]}][#{@camera.token}][#{remote_ip}] Referrer: #{request.referrer}, Camera: #{@camera.name}"
      #   if (ENV['THIEFS_DOMAINS'] || "").split(',').any?{|d| (request.referrer || '').include?(d.strip) }
      #     if params[:action] == 'manifest'
      #       render json: { hls: ENV['THIEFS_URL'].presence || "https://teleset.plus/cameras/thiefs.m3u8" }
      #     else
      #       send_file 'public/thiefs.png', disposition: 'inline'
      #     end
      #     return
      #   end

      #   if (ENV['THIEFS_IPS'] || "").split(',').any?{|d| remote_ip == d.strip }
      #     if params[:action] == 'manifest'
      #       render json: { hls: ENV['THIEFS_URL'].presence || "https://teleset.plus/cameras/thiefs.m3u8" }
      #     else
      #       send_file 'public/thiefs.png', disposition: 'inline'
      #     end
      #     return
      #   end
      # end

      # def get_camera_status
      #   url = "https://cameras.teleset.plus/#{@camera.token}/recording_status.json?request=motion_log,ranges"

      #   Rails.cache.fetch url, expires_in: 5 * 60 do
      #     if token = get_camera_token
      #       url += "&token=#{token}"
      #     end

      #     resp = Faraday.get(url)
      #     if resp.status == 200
      #       JSON.parse(resp.body)[@camera.token]
      #     else
      #       {}
      #     end
      #   end
      # end

      def generate_camera_token
        secure_token = @camera.secure_token
        if secure_token.blank?
          return nil
        end

        lifetime = 3600 * 1
        starttime = Time.now.to_i - 300 # 300 is desync
        endtime = Time.now.to_i + lifetime
        salt = rand(8**8).to_s(8)

        Rails.logger.warn "[Camera##{params[:action]}] Token=#{@camera.token}, IP=#{remote_ip}, Referrer=#{request.referrer}"

        hash = Digest::SHA1.hexdigest(@camera.token + remote_ip + starttime.to_s + endtime.to_s + secure_token + salt)
        token = hash + '-' + salt + '-' + endtime.to_s + '-' + starttime.to_s

        token
      end

      def get_interval(maxValue = 3600)
        [120, [params[:interval].to_i, maxValue].min].max
      end

      def remote_ip
        Rails.logger.warn "[Camera##{params[:action]}] Token=#{@camera.token}, IP: #{request.ip}, Remote IP: #{request.remote_ip}"
        request.ip
      end
  end
end
