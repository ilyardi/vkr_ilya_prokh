module Api
    module V1
      class CamerasController < BaseController
        load_and_authorize_resource

        before_action :fetch_camera, only: [:add_agreement, :delete_agreement]

        def index
          @order = params[:order] || 'created_at'
          @order_by = params[:order_by] || 'desc'
          filter = params[:search] || {}

          allowed_types = ['free']
          allowed_types << 'home' if can?(:home, Camera)
          allowed_types << 'business' if can?(:business, Camera)

          @cameras = @cameras.where(camera_type: allowed_types)
          @cameras = @cameras.where(camera_type: filter[:camera_type]) if filter[:camera_type]

          @cameras = @cameras.where("CAST(cameras.id as VARCHAR) ILIKE ?", "%#{filter[:id]}%") if filter[:id].present?
          @cameras = @cameras.where("cameras.name ILIKE ?", "%#{filter[:name]}%") if filter[:name].present?
          @cameras = @cameras.where("cameras.token ILIKE ?", "%#{filter[:token]}%") if filter[:token].present?
          @cameras = @cameras.where("cameras.street ILIKE ?", "%#{filter[:street]}%") if filter[:street].present?
          @cameras = @cameras.order(@order_by => @order).page(page_param).per(per_param)
        end

        def create
          @camera = Camera.create(camera_params)
          set_bad_request(@camera)
        end

        def show
          @camera = Camera.find(params[:id])
        end

        def update
          @camera = Camera.find(params[:id])
          @camera.update(camera_params)
          set_bad_request(@camera)
        end

        def add_agreement
          @camera_agreement = @camera.camera_agreements.create(agrm_id: params[:agrm_id])
          set_bad_request(@camera_agreement)
        end

        def delete_agreement
          @camera_agreement = @camera.camera_agreements.find_by(agrm_id: params[:agrm_id])
          if @camera_agreement
            @camera_agreement.destroy
          else
            raise ActiveRecord::RecordNotFound
          end
        end

        def destroy
          @camera = Camera.find(params[:id])
          @camera.destroy
          set_bad_request(@camera)
        end

        def archive
          server = 'cameras'
          case @camera.server_id
          when 1
            server = 'cameras'
          when 2
            server = 'cameras2'
          end

          url = "https://#{server}.teleset.plus/#{@camera.token}/embed.html?dvr=true&autoplay=false"
          if token = generate_camera_token
            url += "&token=#{token}"
          end
          redirect_to url
        end

        private

        def set_bad_request(model)
          if model.errors.size > 0
            render status: :bad_request
          end
        end

        def fetch_camera
          @camera = Camera.find(params[:camera_id])
        end

        def agreement_params
          params.permit(:camera_id, :agrm_id)
        end

        def camera_params
          params.require(:camera).permit(:name,
            :camera_type,
            :token,
            :is_archive,
            :is_private,
            :street,
            :building,
            :secure_token,
            :latitude,
            :longitude,
            :active,
            :slug,
            :model,
            :serial,
            :description,
            :mac,
            :ip,
            :archive_depth,
            :rtsp_url,
            :server_id
          )
        end

        def generate_camera_token
          secure_token = @camera.secure_token
          if secure_token.blank?
            return nil
          end

          lifetime = 3600 * 1
          starttime = Time.now.to_i - 300 # 300 is desync
          endtime = Time.now.to_i + lifetime
          salt = rand(8**8).to_s(8)

          Rails.logger.warn "[ApiCamera##{params[:action]}] Token=#{@camera.token}, IP=#{request.ip}"

          hash = Digest::SHA1.hexdigest(@camera.token + request.ip + starttime.to_s + endtime.to_s + secure_token + salt)
          token = hash + '-' + salt + '-' + endtime.to_s + '-' + starttime.to_s

          token
        end
      end
    end
  end
