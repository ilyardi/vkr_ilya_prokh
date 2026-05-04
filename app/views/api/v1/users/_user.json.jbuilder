json.(user, :id, :email, :role, :name, :chat_id, :department_id, :lb_manager_id, :active)
json.department user.department&.name

json.pass_is_old user.pass_changed_at < Time.new(2024,9,1)

if user.errors.size > 0
    json.errors user.errors
end
