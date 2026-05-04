json.available_services do
  json.array! @available_services, partial: 'available_service', as: :available_service
end

json.meta do
  json.total @available_services.total_count
  json.page page_param
  json.per per_param
end
