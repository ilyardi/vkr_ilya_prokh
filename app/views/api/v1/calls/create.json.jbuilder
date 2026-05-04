json.new_call @new_call

if @new_call.errors.size > 0
    json.errors @new_call.errors
end