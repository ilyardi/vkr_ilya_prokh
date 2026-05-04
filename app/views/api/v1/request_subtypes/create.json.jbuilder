json.request_subtype @request_subtype

if @request_subtype.errors.size > 0
    json.errors @request_subtype.errors
end