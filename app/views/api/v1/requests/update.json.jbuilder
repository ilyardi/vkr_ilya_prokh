json.request @request, partial: 'show', as: :request

if @children_errors.present?
  json.children_errors @children_errors
end

if @update_errors.present?
  json.update_errors @update_errors
end

json.helper_users @request.children.pluck(:executor_user_id)
