class CustomChangesAdapter
    # @param changes Hash
    # @return Hash
    def diff(changes)
        new_changes = {}
        changes.each_pair do |key, value| 
            new_changes[key] = value
            case key
            # when 'request_type_id'
            #     new_changes['request_type'] = RequestType.find(value[1]).name
            # when 'request_status_id'
            #     new_changes['request_status'] = RequestStatus.find(value[1]).name
            # when 'request_reason_id'
            #     new_changes['request_reason'] = RequestReason.find(value[1]).description
            # when 'responsible_user_id'
            #     new_changes['responsible_user'] = User.find(value[1]).name
            # when 'executor_user_id'
            #     new_changes['executor_user'] = [User.find(value[0]).name, User.find(value[1]).name]
            when 'agrm_id'
                new_changes['agreement_number'] = LbAgreement.find(value[1]).number
            # else 
                # new_changes[key] = value[1]
            end
        end
        new_changes
    end
end


PaperTrail.config.object_changes_adapter = CustomChangesAdapter.new


# @users = User.all.index_by(&:id)