class Project < ApplicationRecord
    has_paper_trail skip: [:id, :created_at, :updated_at, :project_managers_ids], versions: {
        scope: -> {order('created_at desc')}
    }

    enum status: { at_work: "at_work", archive: "archive", decline: "decline" }

    validates :project_type_id, :status, presence: true

    has_many :requests
    belongs_to :project_type
    belongs_to :project_status
    belongs_to :responsible_user, class_name: "User"

    after_commit :send_notification, on: [:create, :update]

    def send_notification
        UserNotifier.create_notification(self)
    end

    def get_type_id
        self.project_type_id
    end

    def get_user_ids
        users_ids = [self.responsible_user_id]
        self.project_managers_ids.each{|item| users_ids << item.to_i}
        users_ids
    end

    def get_fields ()
        fields = {}
        fields['name'] = self.name
        fields['description'] = self.description
        fields['project_type'] = self.project_type&.name
        fields['project_status'] = self.project_status&.name
        fields['responsible_user'] = self.responsible_user&.name
        fields['plan_started_at'] = self.plan_started_at&.strftime('%d.%m.%Y %H:%M:%S')
        fields['plan_finished_at'] = self.plan_finished_at&.strftime('%d.%m.%Y %H:%M:%S')
        fields
    end
end
