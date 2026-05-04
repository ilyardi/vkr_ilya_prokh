module Api
    module V1
      class WorkingDaysController < BaseController
        load_and_authorize_resource

        def index
          date = params[:date].to_time || Time.today
          roles = ['main_engineer', 'main_video_engineer' , 'video_engineer', 'connect_engineer', 'service_engineer', 'technical_engineer', 'car', 'lead_engineer']
          users = User.where(role: roles).order(name: :asc)
          @schedules = {
            connection_department: [],
            service_department: [],
            car_park: [],
            administrative_department: [],
            exploitation_department: [],
          }
          users.each do |user|
            user_schedule = {
                user_id: user.id,
                name: user.name,
                working_days: user.working_days.by_month_in_date(date) || [],
              }
            case user.department&.name
            when 'connection_department'
              @schedules[:connection_department] << user_schedule
            when 'service_department'
              @schedules[:service_department] << user_schedule
            when 'exploitation_department'
              @schedules[:exploitation_department] << user_schedule
            when 'car_park'
              @schedules[:car_park] << user_schedule
            when 'administrative_department'
              @schedules[:administrative_department] << user_schedule
            end
          end
        end

        def create
          @working_day = WorkingDay.create(working_day_params)
          set_bad_request(@working_day)
        end

        def fill_month
          date = params[:date]&.to_time.beginning_of_month
          end_date = date+1.month
          @user = User.find(params[:user_id])
          @working_days = []
          while date < end_date
            if date.saturday? || date.sunday?
              date += 1.day
              next
            end
            working_day = @user.working_days.find_or_create_by(date: date)
            @working_days << working_day if working_day.errors.size == 0
            date += 1.day
          end
        end

        def destroy
          @working_day = WorkingDay.find(params[:id])
          @working_day.destroy
          set_bad_request(@working_day)
        end

        private

        def set_bad_request(model)
          if model.errors.size > 0
            render status: :bad_request
          end
        end

        def working_day_params
          params.require(:working_day).permit(:user_id, :date)
        end
      end
    end
  end
