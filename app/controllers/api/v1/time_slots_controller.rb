module Api
  module V1
    class TimeSlotsController < BaseController
      def index
        authorize! :index, :TimeSlot

        department = params[:department] || 'service_department'
        date = (params[:date] || Date.today).to_time.beginning_of_day
        date_end = date.end_of_day
        date_end = (date_end + 15.hour).beginning_of_hour if params[:night_shift]

        @time_slots = []

        roles_for_personal_slots = ['service_engineer', 'technical_engineer', 'builder_engineer']

        if roles_for_personal_slots.include?(current_user.role)
          @users = User.joins(:working_days)
                       .where('working_days.date = ? AND user_id = ?', date, current_user.id)
        elsif current_user.role == 'connect_engineer'
          @users = User.get_users_by_department('connection_department')
                       .joins(:working_days)
                       .where('working_days.date = ?', date)
        else
          @users = User.get_users_by_department(department)
                       .joins(:working_days)
                       .where('working_days.date = ?', date)
        end

        return if @users.empty?

        @users = @users.order(:name)
        users_ids = @users.pluck(:id)

        requests = Request.where("#{department == "car_park" ? "car_id" : "executor_user_id"} IN (?)", users_ids)
                          .where(plan_started_at: date..date_end,
                                 plan_finished_at: date..date_end)

        request_types = RequestType.all.index_by(&:id)

        time_slots = []
        base_hours = [9,10,11,12,13,14,15,16,17]
        base_hours += [18,19,20] if department.in?(%w[service_department car_park])
        base_hours = [21,22,23,0,1,2,3,4,5,6,7,8] if params[:night_shift].present?

        base_hours.each do |hour|
          [0, 15, 30, 45].each do |minute|
            time_slots << { hour: hour, minute: minute }
          end
        end

        time_slots.each do |ts|
          current_hour   = ts[:hour]
          current_minute = ts[:minute]
          time_start     = current_minute
          time_end       = current_minute + 15

          if time_end == 60
            time_end = 0
            hour_end = current_hour + 1
          else
            hour_end = current_hour
          end

          fix_date = [0,1,2,3,4,5,6,7,8].include?(current_hour) ? date + 1.day : date

          start_time = fix_date.change(hour: current_hour, min: time_start)
          end_time   = if hour_end != current_hour
                         fix_date.change(hour: hour_end, min: time_end)
                       else
                         fix_date.change(hour: current_hour, min: time_end)
                       end

          requests_by_params = requests.where(
            'plan_started_at < ? AND plan_finished_at > ?', end_time, start_time
          )

          @time_slots << {
            time: "#{current_hour}:#{current_minute.to_s.rjust(2, '0')}",
            requests: requests_by_params.map do |request|
              resource = {}
              case request.resource_type
              when 'LbAgreement'
                if defined?(DemoLbAgreement) && DemoLbAgreement.demo?(request.resource_id)
                  local_ag = Agreement.find_by(external_id: request.resource_id)
                  demo_res = local_ag ? DemoLbAgreement.new(local_ag, Debtor.find_by(agrm_id: request.resource_id)) : nil
                  resource = {
                    identifier: demo_res&.number,
                    address:    demo_res&.lb_account&.address_connect,
                    name:       demo_res&.lb_account&.name,
                    phone:      demo_res&.lb_account&.mobile,
                  }
                else
                  begin
                    resource = {
                      identifier: request.resource.number,
                      address:    request.resource.lb_account.address_connect,
                      name:       request.resource.lb_account.name,
                      phone:      request.resource.lb_account.mobile,
                    }
                  rescue ActiveRecord::RecordNotFound, NoMethodError
                    resource = { identifier: nil, address: nil, name: nil, phone: nil }
                  end
                end
              when 'LbDevice'
                resource = {
                  identifier: request.resource.device_name,
                  address: request.resource.get_address,
                }
              end

              {
                id: request.id,
                type: request_types[request.request_type_id].name,
                user_id: department == "car_park" ? request.car_id : request.executor_user_id,
                plan_started_at: request.plan_started_at,
                plan_finished_at: request.plan_finished_at,
                description: request.description,
                resource: resource,
              }
            end
          }
        end
      end

      def slots_by_week
        authorize! :slots_by_week, :TimeSlot

        department = params[:department] || 'service_department'
        user_field_name = (department == "car_park") ? "car_id" : "executor_user_id"
        st_week = (params[:date]&.to_time || Time.now).beginning_of_week
        end_week = st_week.end_of_week

        @time_slots = {}
        @working_hours = []
        base_hours = [9,10,11,12,13,14,15,16,17]
        base_hours += [18,19,20] if department.in?(%w[service_department car_park])
        base_hours = [21,22,23,0,1,2,3,4,5,6,7,8] if params[:night_shift].present?

        base_hours.each do |hour|
          [0, 15, 30, 45].each do |minute|
            @working_hours << { hour: hour, minute: minute }
          end
        end

        @users = User.get_users_by_department(department).order(:id)
        user_ids = @users.pluck(:id)

        index = 0
        while st_week+index.day < end_week
          day = (st_week+index.day).day
          @time_slots[day]={}
          user_ids.each do |user_id|
            @time_slots[day][user_id] = {weekend: true}
          end
          index = index + 1
        end

        working_days = WorkingDay.where(user_id: user_ids, date: st_week..end_week)

        working_days.each do |record|
          day_of_week = record.date.day
          @working_hours.each do |time|
            time_key = "#{time[:hour]}:#{time[:minute].to_s.rjust(2, '0')}"
            @time_slots[day_of_week][record.user_id][time_key] = { request_ids: [], box_size: 1 }
            @time_slots[day_of_week][record.user_id][:weekend] = false
          end
        end

        requests = Request.where("#{user_field_name} IN (?)", user_ids)
                          .where(plan_started_at: st_week..end_week, plan_finished_at: st_week..end_week)

        requests.each do |request|
          date = request.plan_started_at
          day = date.day
          next unless @working_hours.any? { |wh| wh[:hour] == date.hour && wh[:minute] == date.min }
          next if @time_slots[day][request[user_field_name]][:weekend]

          duration = ((request.plan_finished_at - request.plan_started_at)/900).round
          duration = 1 if duration < 1
          new_hours = @time_slots[day][request[user_field_name]]
          time_key = "#{date.hour}:#{date.min.to_s.rjust(2, '0')}"
          new_hours[time_key][:request_ids] += [request.id]
          new_hours[time_key][:box_size] = duration
          if duration > 1
            start_time = request.plan_started_at
            1.upto(duration - 1) do |i|
              time_to_delete = start_time + (i * 15).minutes
              time_key = "#{time_to_delete.hour}:#{time_to_delete.min.to_s.rjust(2, '0')}"
              new_hours.delete(time_key)
            end
          end
          @time_slots[day][request[user_field_name]] = new_hours
        end
      end

      def personal
        authorize! :personal, :TimeSlot

        date = params[:date].to_time
        user = current_user
        user_id = user.id
        user_id = 9 if current_user.tester?
        @requests = Request.where(
          plan_started_at: date.beginning_of_day..date.end_of_day,
          plan_finished_at: date.beginning_of_day..date.end_of_day,
          executor_user_id: user_id
        ).order(plan_started_at: :asc)
      end
    end
  end
end
