module Api
  module V1
    class NotificationRulesController < BaseController
      # load_and_authorize_resource

      def index
        filter = params[:filter] || {}
        @notification_rules = NotificationRule.all
        @notification_rules = @notification_rules.where(user_id: filter[:user_id]) if filter[:user_id].present?

        @notification_rules = @notification_rules.index_by(&:target_type)

        @options = {}
        I18n.t("user_notification.models").each do |key, value|
          @options[key] = {
              name: value[:name],
              fields: value[:fields].map{|key, value| {label: value , value: key.to_s }},
          }
          case key.to_s
          when "Request"
              @options[key][:types] = RequestType.all.map{|value| {label: value.name, value: value.id }}
          when "Project"
              @options[key][:types] = ProjectType.all.map{|value| {label: value.name, value: value.id }}
          when "Expense"
              @options[key][:types] = ExpenseType.all.map{|value| {label: value.name, value: value.id }}
          end
        end
      end


      def create
        @notification_rule = NotificationRule.find_or_initialize_by(user_id: rule_params[:user_id], target_type: rule_params[:target_type])
        @notification_rule.update(rule_params)
        set_bad_request(@notification_rule)
      end

      private

      def set_bad_request(model)
        if model.errors.size > 0
          render status: :bad_request
        end
      end

      def rule_params
        params.require(:notification_rule).permit(
          :user_id,
          :target_type,
          searcheble_fields: [],
          searcheble_types: [],
          dislay_fields: [],
        )
      end
    end
  end
end
