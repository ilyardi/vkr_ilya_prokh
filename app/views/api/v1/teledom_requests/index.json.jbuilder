json.teledom_requests do
  json.array! @teledom_requests, partial: 'teledom_request', as: :teledom_request
end

json.statuses I18n.t("models.teledom_request.statuses").map{|key, value| {label: value , value: key }}
json.subjects I18n.t("models.teledom_request.subjects").map{|key, value| {label: value , value: key }}

json.meta do
  json.total @teledom_requests.total_count
  json.page page_param
  json.per per_param
end
