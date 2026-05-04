class UserNotifier
    # def self.create_notification(target_item)
    #     version = target_item.versions.first
    #     return unless version.present?
    #     return if UserNotification.find_by(version_id: version.id).present?
    #     user_ids = target_item.get_user_ids
    #     user_ids.delete(version.whodunnit)

    #     change_keys = version.object_changes.keys.map{|key| key.sub("_id", "")}

    #     target_fields = target_item.get_fields

    #     rules = NotificationRule.where(target_type: version.item_type, action: version.event)
    #     rules = rules.where('user_id != ?', version.whodunnit) if version.whodunnit.present?
    #     rules.each do |rule|
    #         fields = change_keys & rule.notify_fields
    #         next if rule.target_id.present? && rule.target_id != version.item_id
    #         next if rule.sub_target_id.present? && rule.sub_target_id != target_item[rule.sub_target_type.foreign_key]
    #         next if rule.notify_fields.present? && fields.size == 0
    #         user_ids << rule.user_id
    #     end

    #     user_ids.uniq

    #     data = {
    #         title: I18n.t("user_notification.action.#{version.event}.#{version.item_type.snakecase}", number: target_item.id),
    #         body: ""
    #     }

    #     change_keys.each do |field_name|
    #         next if field_name == "resource" || field_name == "resource_type"
    #         data[:body] += "<b>#{I18n.t("models.fields.#{version.item_type.snakecase}.#{field_name}")}:</b> #{target_fields[field_name]} \n"
    #     end

    #     user_ids.each do |user_id|
    #         notification = UserNotification.create(data: data, user_id: user_id, version_id: version.id)
    #         notification.send_telegram
    #     end
    # end

    def self.create_notification(target_item)
        version = target_item.versions.first
        return unless version.present?
        return if UserNotification.find_by(version_id: version.id).present?
        user_ids = target_item.get_user_ids
        user_ids.uniq!
        user_ids.delete(version.whodunnit.to_i) if version.whodunnit.present?

        change_keys = version.object_changes.keys.map{|key| key.sub("_id", "")}
        target_fields = target_item.get_fields

        user_ids.each do |user_id|
            rule = NotificationRule.find_by(target_type: version.item_type, user_id: user_id)
            next unless rule.present?
            searcheble_fields = rule.searcheble_fields & change_keys
            next unless rule.searcheble_types.include?(target_item.get_type_id) && searcheble_fields.present?

            data = {
                title: I18n.t("user_notification.action.#{version.event}.#{version.item_type.snakecase}", number: target_item.id),
                body: ""
            }

            # data[:body] += "Дополнительная информация:\n"
            rule.dislay_fields.each do |field_name|
                data[:body] += "<b>#{I18n.t("user_notification.models.#{version.item_type}.fields.#{field_name}")}:</b> #{target_fields[field_name]} \n"
            end

            data[:body] += "\n"
            searcheble_fields.each do |field_name|
                data[:body] += "<b>#{I18n.t("user_notification.models.#{version.item_type}.fields.#{field_name}")}:</b> #{target_fields[field_name]} \n"
            end

            notification = UserNotification.create(data: data, user_id: user_id, version_id: version.id)
            notification.send_telegram
        end
    end

    # Для конфигурируемых уведомлений(функционал в разработке)
    # create_mandatory_notice
    # def self.create_notification(target_item)
    #     version = target_item.versions.first
    #     return unless version.present?
    #     change_keys = version.object_changes.keys.map{|key| key.sub("_id", "")}
    #     rules = NotificationRule.where(target_type: version.item_type, action: version.event)
    #     rules = rules.where('user_id != ?', version.whodunnit) if version.whodunnit.present?
    #     target_fields = target_item.get_fields
    #     rules.each do |rule|
    #         fields = change_keys & rule.notify_fields
    #         next if rule.target_id.present? && rule.target_id != version.item_id
    #         next if rule.sub_target_id.present? && rule.sub_target_id != target_item[rule.sub_target_type.foreign_key]
    #         next if rule.notify_fields.present? && fields.size == 0
    #         output_fields = rule.notify_fields.present? ? rule.notify_fields : change_keys
    #         data = {
    #             title: I18n.t("user_notification.action.#{rule.action}.#{rule.target_type.snakecase}", number: target_item.id),
    #             body: ""
    #         }
    #         output_fields.each do |field_name|
    #             data[:body] += "<b>#{I18n.t("models.fields.#{rule.target_type.snakecase}.#{field_name}")}:</b> #{target_fields[field_name]} \n"
    #         end
    #         notification = UserNotification.create(data: data, user_id: rule.user_id)
    #         notification.send_telegram
    #     end
    # end
end
