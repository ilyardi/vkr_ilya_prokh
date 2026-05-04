module Api
  module V1
    class CallsController < BaseController
      load_and_authorize_resource

      def index
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 10).to_i
        @calls = Call.ordered.includes(:call_reason, :lb_manager, :lb_account)

        filter = params[:filter] || {}
        @calls = @calls.created_at(filter[:created_at]) if filter[:created_at]
        @calls = @calls.page(@page).per(@per)
      end

      def create
        in_params = call_params
        in_params['lb_manager_id'] = current_user.lb_manager_id
        @new_call = Call.create(in_params)
        set_bad_request(@new_call)
      end

      def report
        filter = params[:filter] || {}

        @months = Call.select("date_trunc('month', created_at)")
        @months = @months.created_at(filter[:created_at]) if filter[:created_at]
        @months = @months.group("date_trunc('month', created_at)").count

        rows = Call.select("count(*) as cnt, call_reason_id, date_trunc('month', created_at) as month").
          includes(:call_reason).
          group("month, call_reason_id")
        rows = rows.created_at(filter[:created_at]) if filter[:created_at]

        @report = {}
        rows.each do |row|
          name = row.call_reason.name
          cnt = row.cnt.to_f
          month = row.month
          @report[name] ||= {}
          @report[name][month.to_i] = {
            count: cnt,
            percent: (cnt.to_f / @months[month] * 100).round(2)
          }
        end

        if order_by = params[:order_by].to_i
          @report = Hash[@report.to_a.sort_by{|(cr, months)| months[order_by][:count] rescue 0 }.reverse]
        end
      end

      def request_dynamic
        filter = params[:filter] || {}
        group_ids = if filter[:manager_group] == 'all'
          []
        else
          LbManager.where(parent_template: filter[:manager_group]).pluck(:person_id)
        end

        @calls = Call.includes(:lb_manager).order('created_at ASC')
        @calls = @calls.created_at(filter[:created_at]) if filter[:created_at]
        @calls = @calls.where(lb_manager_id: group_ids) if group_ids.present?

        # group_period = filter[:created_at] && filter[:created_at][0] == filter[:created_at][1] ? "hour" : "day"
        group_period = filter[:group] == 'hour' ? 'hour' : 'day'
        @calls = @calls.each_with_object({}) do |c, memo|
          t = c.created_at.public_send("beginning_of_#{group_period}").to_i
          memo[t] ||= { name: t, count: 0 }
          memo[t][:count] += 1
        end.values

        @manager_groups = LbManager.where(template: 1, archive: 0)
      end

      private 

      def call_params
        params.require(:call).permit(
            :lb_account_id, 
            :call_reason_id,
        )
      end

      def set_bad_request(model)
        if model.errors.size > 0
            render status: :bad_request
        end
      end
    end
  end
end
