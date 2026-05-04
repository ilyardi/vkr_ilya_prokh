json.data do
  json.notifications do
    json.array! @notifications do |n|
      json.(n, :id, :data, :status, :notification_type)
      json.created_at n.created_at.to_i
    end
  end

  json.meta do
    json.total @notifications.total_count
    json.unread_count @notifications_unread_count
    json.page @page
    json.per @per
  end
end
