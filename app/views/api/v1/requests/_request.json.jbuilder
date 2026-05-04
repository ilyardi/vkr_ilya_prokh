json.(request,
    :id,
    :plan_started_at,
    :plan_finished_at,
    :created_at,
    :status_notified_at,
    :resource_id,
    :resource_type,
    :description,
)

json.request_type request.request_type
json.request_subtype request.request_subtype
json.request_status request.request_status
json.responsible_user request.responsible_user
json.executor_user request.executor_user
json.request_reason request.request_reason
json.has_files request.documents.size > 0

if request.resource_id.present?
    case request.resource_type
    when 'LbAgreement'
        if defined?(DemoLbAgreement) && DemoLbAgreement.demo?(request.resource_id)
            agreement = Agreement.find_by(external_id: request.resource_id)
            json.resource_address agreement ? DemoLbAgreement.new(agreement).lb_account.address_connect : nil
        else
            begin
                json.resource_address request.resource.lb_account.address_connect
            rescue ActiveRecord::RecordNotFound
                json.resource_address nil
            end
        end
    when 'LbDevice'
        json.resource_address json.address request.resource.get_address
    end
end