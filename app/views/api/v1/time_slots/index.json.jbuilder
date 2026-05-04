json.time_slots do
    json.array! @time_slots
end

json.users do
    json.array! @users, partial: 'user', as: :user
end