json.users do
  json.array! @users, partial: 'user', as: :user
end

json.meta do
  json.total @users.total_count
  json.page page_param
  json.per per_param
end
