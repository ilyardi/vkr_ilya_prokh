json.working_day @working_day
json.department @working_day.user.department&.name

if @working_day.errors.size > 0
  json.errors @working_day.errors
end
