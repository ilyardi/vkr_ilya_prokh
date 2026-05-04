json.request_type @request_type

if @request_type.errors.size > 0
    json.errors @request_type.errors
end