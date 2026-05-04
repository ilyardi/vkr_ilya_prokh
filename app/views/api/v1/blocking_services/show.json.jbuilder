json.blocking_service @blocking_service, partial: 'blocking_service', as: :blocking_service

requests = Request.where("id IN (?)", @blocking_service.request_ids).map do |record|
      {
        id: record.id,
        request_type: record.request_type&.name,
        request_status: record.request_status&.name,
        requests_reason: record.request_reason&.description,
        plan_started_at: record.plan_started_at,
        plan_finished_at: record.plan_finished_at,
        responsible_user: record.responsible_user&.name,
        description: record.description,
      }
    end

json.requests do
  json.array! requests
end

json.statuses I18n.t("models.blocking_service.statuses").map{|key, value| {label: value , value: key }}
