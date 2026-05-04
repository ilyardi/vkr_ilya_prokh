json.(request,:id, :executor_user_id, :plan_started_at, :plan_finished_at, :description, :status_notified_at)

json.type request.request_type.name
json.status request.request_status.name

case request.resource_type
when 'LbAgreement'
    json.resource do 
        json.identifier request.resource.number
        json.address request.resource.lb_account.address_connect
        json.name request.resource.lb_account.name
        json.phone request.resource.lb_account.mobile
    end
when 'LbDevice'
    json.resource do 
        json.identifier request.resource.device_name
        json.address request.resource.get_address
        json.name nil
        json.phone nil
    end
end