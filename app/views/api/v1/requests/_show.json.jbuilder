json.(request,
    :id,
    :resource_id,
    :resource_type,
    :request_type_id,
    :request_subtype_id,
    :request_status_id,
    :responsible_user_id,
    :executor_user_id,
    :car_id,
    :created_at,
    :request_reason_id,
    :request_first_reason_id,
    :project_id,
    :plan_started_at,
    :plan_finished_at,
    :description,
    :parent_id,
)

json.plan_do_daterange [request.plan_started_at, request.plan_finished_at]

if request.project.present?
    json.project request.project
    json.project_managers User.where(id: request.project.project_managers_ids).pluck(:name)
end

if request.errors.size > 0
    json.errors request.errors
end

case request.resource_type
when 'LbAgreement'
    if defined?(DemoLbAgreement) && DemoLbAgreement.demo?(request.resource_id)
        local_agreement = Agreement.find_by(external_id: request.resource_id)
        demo_resource   = local_agreement ? DemoLbAgreement.new(local_agreement, Debtor.find_by(agrm_id: request.resource_id)) : nil
        json.resource do
            json.identifier demo_resource&.number
            json.uid        demo_resource&.uid
            json.address    demo_resource&.lb_account&.address_connect
            json.name       demo_resource&.lb_account&.name
            json.phone      [demo_resource&.lb_account&.mobile, demo_resource&.lb_account&.phone, demo_resource&.lb_account&.fax].reject(&:blank?).join(", ")
        end
    else
        begin
            res = request.resource
            json.resource do
                json.identifier res&.number
                json.uid        res&.uid
                json.address    res&.lb_account&.address_connect
                json.name       res&.lb_account&.name
                json.phone      [res&.lb_account&.mobile, res&.lb_account&.phone, res&.lb_account&.fax].reject(&:blank?).join(", ")
            end
        rescue ActiveRecord::RecordNotFound
            json.resource do
                json.identifier nil
                json.uid        nil
                json.address    nil
                json.name       nil
                json.phone      nil
            end
        end
    end
when 'LbDevice'
    json.resource do
        json.identifier request.resource.device_name
        json.address request.resource.get_address
        json.name nil
        json.phone nil
    end
end

users = User.all.index_by(&:id)
request_types = RequestType.all.index_by(&:id)
request_subtypes = RequestSubtype.all.index_by(&:id)
request_statuses = RequestStatus.all.index_by(&:id)
request_reasons = RequestReason.all.index_by(&:id)
request_first_reasons = RequestFirstReason.all.index_by(&:id)

json.events do
    json.array! @request.versions do |event|
        changes = {}
        changeset = event.changeset
        changeset.each_pair { |key, value|
            case key
            when 'request_type_id'
                changes['request_type'] = request_types[value[1]].present? ? request_types[value[1]].name : "удалено"
            when 'request_subtype_id'
                changes['request_subtype'] = request_subtypes[value[1]].present? ? request_subtypes[value[1]].name : 'удалено'
            when 'request_status_id'
                changes['request_status'] = request_statuses[value[1]].present? ? request_statuses[value[1]].name : 'удалено'
            when 'request_reason_id'
                changes['request_reason'] = request_reasons[value[1]].present? ? request_reasons[value[1]].description : "удалено"
            when 'request_first_reason_id'
                changes['request_first_reason'] = request_first_reasons[value[1]].present? ? request_first_reasons[value[1]].name : "удалено"
            when 'responsible_user_id'
                changes['responsible_user'] = users[value[1]].present? ? users[value[1]].name : "удалено"
            when 'car_id'
                changes['car'] = users[value[1]]&.name || "удалено"
            when 'executor_user_id'
                changes['executor_user'] = value[1].present? ? users[value[1]].name : "удалено"
            when 'resource_id'
                resource_identifier = nil
                case changeset[:resource_type][1]
                when 'LbAgreement'
                    if defined?(DemoLbAgreement) && DemoLbAgreement.demo?(value[1])
                        local_ag = Agreement.find_by(external_id: value[1])
                        resource_identifier = local_ag&.number
                    else
                        resource_identifier = (LbAgreement.find(value[1]).number rescue nil)
                    end
                when 'LbDevice'
                    resource_identifier = (LbDevice.find(value[1]).device_name rescue nil)
                when 'Project'
                    resource_identifier = (Project.find(value[1]).id rescue nil)
                end
                changes['resource_identifier'] = resource_identifier.present? ? resource_identifier : 'отсутствует'
            else
                changes[key] = value[1]
            end
        }
        json.changes changes
        json.id event.id
        json.whodunnit users[event.whodunnit.to_i] ? users[event.whodunnit.to_i].name : 'Система'
        json.event event.event
        json.created_at event.created_at
    end
end