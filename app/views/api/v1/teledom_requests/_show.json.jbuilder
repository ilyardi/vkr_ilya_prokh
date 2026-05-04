json.(teledom_request, :id, :status, :subject, :description, :phone, :user_id, :agrm_id, :created_at)

json.agreement do
  if teledom_request.lb_agreement.present?
    json.partial! 'api/v1/lb_agreements/lb_agreement', lb_agreement: teledom_request.lb_agreement
  end
end

if teledom_request.errors.size > 0
  json.errors request.errors
end

users = User.all.index_by(&:id)

json.events do
  json.array! teledom_request.versions do |event|
    changes = {}
    changeset = event.changeset
    changeset.each_pair { |key, value|
      case key
      when 'status'
        changes['status'] = I18n.t("models.teledom_request.statuses.#{value[1]}")
      when 'subject'
        changes['subject'] = I18n.t("models.teledom_request.subjects.#{value[1]}")
      when 'user_id'
        changes['user'] = users[value[1]].present? ? users[value[1]].name : "удален"
      when 'agrm_id'
        changes['agreement'] = value[1].present? ? LbAgreement.find(value[1]).number : 'удален'
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
