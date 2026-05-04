json.notifications do
  json.array! @notifications do |n|
    json.(n, :id, :data, :status, :notification_type, :created_at)
  end
end

json.meta do
  json.total_count @notifications_total_count
  json.unread_count @notifications_unread_count
  json.page @page
  json.per @per
  json.last_page @page.to_i * @per.to_i >= @notifications_total_count
end
