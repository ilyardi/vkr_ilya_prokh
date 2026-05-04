json.(expense_stage, :id, :name, :alert_timer, :expense_type_id, :active, :priority, :created_at, :updated_at)

if expense_stage.user.present?
  json.user do
    json.partial! 'api/v1/users/user', user: expense_stage.user
  end
else
  if @expense_author.present?
    json.user do
        json.partial! 'api/v1/users/user', user: @expense_author
    end
  end
end
