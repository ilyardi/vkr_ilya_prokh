json.(white_ip_address, :id, :agrm_id, :ip, :description, :created_at, :updated_at)

json.comment ""

json.agreement do
  agreement = white_ip_address.lb_agreement
  json.agrm_id agreement&.agrm_id
  json.number agreement&.number
  json.uid agreement&.uid
  json.address agreement&.lb_account&.address_connect
  json.name agreement&.lb_account&.name
  json.phone [
      agreement&.lb_account&.mobile,
      agreement&.lb_account&.phone,
      agreement&.lb_account&.fax
  ].reject(&:blank?).join(", ")
end

users = User.all.index_by(&:id)

json.events do
    json.array! white_ip_address.versions do |event|
        changes = {}
        changeset = event.changeset
        changeset.each_pair { |key, value|
          if key == 'agrm_id'
            changes['agreement'] = LbAgreement.find(value[1])&.number
            next
          end
          next if (key == 'comment' && !value[1].present?)
          changes[key] = value[1]
        }
        json.changes changes
        json.id event.id
        json.whodunnit users[event.whodunnit.to_i].name
        json.event event.event
        json.created_at event.created_at
    end
end

if white_ip_address.errors.size > 0
    json.errors white_ip_address.errors
end
