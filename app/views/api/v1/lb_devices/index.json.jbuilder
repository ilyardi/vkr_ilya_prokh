json.lb_devices do
    json.array! @lb_devices, partial: 'lb_device', as: :lb_device
end