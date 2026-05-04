json.blocking_services do
  json.array! @blocking_services, partial: 'blocking_service', as: :blocking_service
end

json.statuses I18n.t("models.blocking_service.statuses").map{|key, value| {label: value , value: key }}

json.meta do
  json.total @blocking_services.total_count
  json.page page_param
  json.per per_param
end
