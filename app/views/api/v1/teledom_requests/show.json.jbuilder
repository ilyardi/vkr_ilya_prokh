json.teledom_request @teledom_request, partial: 'show', as: :teledom_request

requests = Request.where("id IN (?)", @teledom_request.request_ids).map do |record|
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

