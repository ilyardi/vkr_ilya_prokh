if @user.errors.present?
  json.validation do
    json.user @user.errors
  end
else
  json.user do
    json.partial! 'site/v4/shared/user', user: @user
  end
end
