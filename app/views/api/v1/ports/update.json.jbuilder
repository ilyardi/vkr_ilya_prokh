json.port @port

if @port.errors.size > 0
    json.errors @port.errors
end