json.request @request, partial: 'show', as: :request

json.request_statuses do
    json.array! @request.request_type.request_statuses.order(:priority => :asc)
end
json.request_subtypes do
    json.array! @request.request_type.request_subtypes
end

json.helper_users @request.children.pluck(:executor_user_id)
