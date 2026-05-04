json.request_status @request_status

if @request_status.errors.size > 0
    json.errors @request_status.errors
end