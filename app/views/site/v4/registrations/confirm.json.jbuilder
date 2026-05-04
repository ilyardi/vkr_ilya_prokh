json.user do
  json.partial! 'site/v4/shared/user', user: @confirmation.user
end
