json.request_reason @request_reason

if @request_reason.errors.size > 0
    json.errors @request_reason.errors
end