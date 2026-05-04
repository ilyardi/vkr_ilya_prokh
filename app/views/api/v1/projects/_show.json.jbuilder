json.(project,
    :id,
    :name,
    :description,
    :project_type_id,
    :responsible_user_id,
    :plan_started_at,
    :plan_finished_at,
    :created_at,
    :status
)
json.number project.id
json.project_managers_ids project.project_managers_ids&.map{|item| item.to_i}

if project.errors.size > 0
    json.errors project.errors
end

# requests = Request.includes(:request_status,:request_type).where(resource_type: 'Project', resource_id: project.id)
# request_ids = requests.pluck(:id)
# events = Version.where("(item_type = 'Project' AND item_id = 5) OR (item_type= 'Request' AND item_id IN (?))", request_ids)

requests = project.requests.includes(:request_status,:request_type)
events = project.versions

json.requests do
    json.array! requests.map{|record|
        {
            id: record.id,
            request_type: record.request_type.name,
            request_status: record.request_status.name,
            plan_started_at: record.plan_started_at,
            plan_finished_at: record.plan_finished_at,
            responsible_user: record.responsible_user.name
        }
    }
end

users = User.all.index_by(&:id)
request_types = RequestType.all.index_by(&:id)
request_subtypes = RequestSubtype.all.index_by(&:id)
request_statuses = RequestStatus.all.index_by(&:id)
request_reasons = RequestReason.all.index_by(&:id)
project_types = ProjectType.all.index_by(&:id)
project_statuses = ProjectStatus.all.index_by(&:id)

json.events do
    json.array! events do |event|
        changes = {}
        changeset = event.object_changes
        changeset.each_pair { |key, value|
            case key
            when 'project_type_id'
                changes['project_type'] = project_types[value[1]]&.name
            when 'project_status_id'
                changes['project_status'] = project_statuses[value[1]]&.name
            when 'project_managers_ids'
                # changes['project_managers'] = value[1].present? ? value[1].map{|item| users[item.to_i].name} : nil
            else
                changes[key] = value[1]
            end
        }
        json.item_type event.item_type
        json.item_id event.item_id
        json.changes changes
        json.id event.id
        json.whodunnit users[event.whodunnit.to_i] ? users[event.whodunnit.to_i].name : 'Система'
        json.event event.event
        json.created_at event.created_at
    end
end
