json.(current_user, :id, :email,:role, :name)
json.ability current_ability.to_list
json.short_name current_user.get_short_name

json.pass_is_old current_user.pass_changed_at < Time.new(2024,9,1)

