module Api
  module V1
    class RequestsController < BaseController

      def index
          filter = params[:search] || {}

          street_id = filter[:street_id] || nil
          building_id = filter[:building_id] || nil
          entrance_id = filter[:entrance_id] || nil
          flat_id = filter[:flat_id] || nil
          request_reason_ids = filter[:request_reasons] || nil
          request_subtype_ids = filter[:request_subtypes] || nil

          @order = params[:order].presence || 'desc'
          @order_by = params[:order_by].presence || 'created_at'

          devices = LbDevice.where(:street_id => street_id) if street_id.present?
          devices = devices.where(:building_id => building_id) if building_id.present?
          devices = devices.where(:entrance_id => entrance_id) if entrance_id.present?
          devices = devices.where(:flat_id => flat_id) if flat_id.present?
          device_ids = devices.pluck("devices.device_id") if devices.present? && devices.size > 0

          agreements = LbAgreement.joins(lb_account: :lb_accounts_addrs).
                          where('accounts_addr.street = ? AND accounts_addr.type=2', street_id) if street_id.present?
          agreements = agreements.where("accounts_addr.building = ?", building_id) if building_id.present?
          agreements = agreements.where("accounts_addr.flat = ?", flat_id) if flat_id.present?
          agreements = agreements.where("accounts_addr.entrance = ?", entrance_id) if entrance_id.present?
          agrm_ids = agreements.pluck('agreements.agrm_id') if agreements.present? && agreements.size > 0

          @requests = Request.includes(:request_type, :request_status, :request_reason, :responsible_user, :executor_user).joins(:request_status)
          if filter[:agrm_id]
            if defined?(DemoLbAgreement) && DemoLbAgreement.demo?(filter[:agrm_id])
              @requests = Request.where(resource_type: 'LbAgreement', resource_id: filter[:agrm_id])
            else
              @requests = LbAgreement.find(filter[:agrm_id]).requests
            end
          end
          @requests = @requests.where(parent_id: nil) if filter[:exclude_parent].present?
          @requests = @requests.where('requests.id = ?', filter[:number].to_i) if filter[:number].present?
          @requests = @requests.where('requests.description ILIKE ?', "%#{filter[:description]}%") if filter[:description].present?
          @requests = @requests.joins(:request_type).where("NOT(request_types.name = 'Служебная')") unless filter[:show_all].present?
          @requests = @requests.joins(:request_type).where("NOT(request_types.name = 'Другое')") unless filter[:show_all].present?
          @requests = @requests.where(project_id: filter[:project_id]) if filter[:project_id].present?
          @requests = @requests.where(request_reason_id: request_reason_ids) if request_reason_ids.present?
          @requests = @requests.where(request_subtype_id: request_subtype_ids) if request_subtype_ids.present?
          @requests = @requests.where('requests.request_type_id = ?', filter[:request_type_id]) if filter[:request_type_id].present?
          # @requests = @requests.where('requests.request_status_id = ?', filter[:request_status_id]) if filter[:request_status_id].present?
          @requests = @requests.where('request_statuses.name IN (?)', filter[:request_statuses]) if filter[:request_statuses].present?
          @requests = @requests.where('requests.responsible_user_id = ?', filter[:responsible_user_id]) if filter[:responsible_user_id].present?
          @requests = @requests.where('requests.executor_user_id = ?', filter[:executor_user_id]) if filter[:executor_user_id].present?
          @requests = @requests.where('(requests.plan_started_at < ?) OR requests.plan_started_at IS NULL', Time.now+2.day) if filter[:actual].present?
          @requests = @requests.where(plan_started_at: Date.today.beginning_of_day..Date.today.end_of_day) if filter[:do_today].present?
          @requests = @requests.where(created_at: filter[:created_at][0]..filter[:created_at][1].to_time.end_of_day) if filter[:created_at].present? && filter[:created_at][0].present?
          @requests = @requests.where(plan_started_at: filter[:doned_at][0]..filter[:doned_at][1].to_time.end_of_day,
              plan_finished_at: filter[:doned_at][0]..filter[:doned_at][1].to_time.end_of_day) if filter[:doned_at].present? && filter[:doned_at][0].present?
          @requests = @requests.where("(requests.resource_id in (?) AND requests.resource_type = 'LbAgreement') OR (requests.resource_type = 'LbDevice' AND requests.resource_id in (?))", agrm_ids, device_ids) if street_id.present?
          @requests = @requests.order(@order_by => @order) if @order_by && @order
          @requests = @requests.page(page_param).per(per_param) if page_param && per_param
      end

      def show
          @request = Request.find(params[:id])
      end

      def create
          in_params = request_params
          in_params['responsible_user_id'] = current_user.id unless in_params['responsible_user_id'].present?
          in_params[:status_updated_at] = Time.now if in_params[:request_status_id].present?
          in_params[:comment] = params[:comment] if params[:comment].present?
          @request = Request.create(in_params)
          if params[:blocking_service_id].present? && !@request.errors.present?
              if blocking_service = BlockingService.find_by(id: params[:blocking_service_id]).presence
                  new_request_arr = blocking_service.request_ids || []
                  new_request_arr << @request.id
                  puts new_request_arr
                  blocking_service.update(request_ids: new_request_arr)
              end
          end

          @children_errors = []
          if !(@request.errors.present?) && params[:helper_users].present?
              params[:helper_users].each do |user_id|
                  child_request = @request.add_helper(user_id)
                  if child_request.errors.present?
                      @children_errors << [user_id, child_request.errors]
                  end
              end
          end
          set_bad_request(@request)
      end

      def update
          @request = Request.find(params[:id])
          in_params = request_params
          if in_params[:request_status_id].present? && @request.request_status_id != in_params[:request_status_id]
              in_params[:status_updated_at] = Time.now
              in_params[:status_notified_at] = nil
          end
          in_params[:comment] = params[:comment] if params[:comment].present?
          @request.update(in_params)
          @update_errors = @request.update_helpers
          @children_errors = []
          if !(@request.errors.present?) && params[:helper_users].present?
              current_helpers_ids = @request.children.pluck(:executor_user_id)
              new_helpers_ids = params[:helper_users] - current_helpers_ids
              new_helpers_ids.each do |user_id|
                  child_request = @request.add_helper(user_id)
                  if child_request.errors.present?
                      @children_errors << [user_id, child_request.errors]
                  end
              end
          end
          set_bad_request(@request)
      end

      def destroy
          @request = Request.find(params[:id])
          @request.destroy
          set_bad_request(@request)
      end

      def destroy_helper
          request = Request.find(params[:id])
          helper_request = request.children.find_by(executor_user_id: params[:user_id])
          helper_request.destroy
          @current_helpers = request.children.pluck(:executor_user_id)
          set_bad_request(helper_request)
      end

      def report
        @request = Request.find(params[:id])

        @data = {
          request_number: @request.id,
          request_desc: @request.description || '',
          request_subtype: (@request.request_subtype.name if @request.request_subtype.present?) || '',
          executor_user: (@request.executor_user.get_short_name if @request.executor_user.present?) || '',
          day: (@request.plan_started_at.day if @request.plan_started_at.present?) || '',
          month: (I18n.t('date.month_names')[@request.plan_started_at.month] if @request.plan_started_at.present?) || '',
          year: (@request.plan_started_at.strftime("%y") if @request.plan_started_at.present?) || '',
          time: (@request.plan_started_at.strftime("%R") if @request.plan_started_at.present?) || '',
        }

        resource = @request.resource

        if resource && @request.resource_type == 'LbAgreement'
          addr = resource.lb_account.lb_accounts_addrs.where('type = ?', 2).order('uid').first
          account = resource.lb_account
          @data[:agrm_number] = resource.number || ''
          @data[:abonent_surname] = account.abonent_surname || ''
          @data[:abonent_name] = account.abonent_name || ''
          @data[:abonent_patronymic] = account.abonent_patronymic || ''
          @data[:abonent_phone] = account.phone || ''
          if addr.present?
              @data[:street] = (addr.lb_address_street.name if addr.lb_address_street.present?) || ''
              @data[:building] = ([addr.lb_address_building.name, addr.lb_address_building.block].reject(&:blank?).join("/") if addr.lb_address_building.present?) || ''
              @data[:entrance] = (addr.lb_address_entrance.name if addr.lb_address_entrance.present?) || ''
              @data[:flat] = (addr.lb_address_flat.name if addr.lb_address_flat.present?) || ''
              @data[:floor] = (addr.lb_address_floor.name if addr.lb_address_floor.present?) || ''
          end
        end
      end

      def resource_search
        context = params[:context]
        sql = <<-SQL
          select resources.id, resources.context, resources.resource_type
          from (
              select ag.agrm_id as id, ag.number as context, "LbAgreement" as resource_type
              from agreements ag
              union
              select dv.device_id as id, dv.device_name as context, "LbDevice" as resource_type
              from devices dv
              ) as resources
          where resources.context LIKE "%#{context}%"
        SQL
        result = LbAgreement.connection.execute(sql).to_a
        @resources = result.map do |record|
          {
              id: record[0],
              name: record[1],
              resource_type: record[2]
          }
        end
        @resources = @resources[0..20]
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def request_params
        params.require(:request).permit(
          :request_type_id,
          :request_subtype_id,
          :request_status_id,
          :request_reason_id,
          :request_first_reason_id,
          :project_id,
          :executor_user_id,
          :responsible_user_id,
          :description,
          :plan_started_at,
          :plan_finished_at,
          :resource_id,
          :resource_type,
          :car_id
        )
      end

      def resource_params
        params.require(:resource).permit(
          :resource_type,
          :resource_id,
        )
      end
    end
  end
end
