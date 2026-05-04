class ValidateTimeSlotExecutor < ActiveModel::Validator
    def validate(record)
        requests = Request.where('plan_started_at < ? AND plan_finished_at > ? AND executor_user_id = ?',record.plan_finished_at-1.minutes, record.plan_started_at + 1.minutes, record.executor_user_id)
        requests = requests.where('id != ?', record.id) if record.id.present?
        record.errors.add :plan_do_daterange, 'У работника назначена другая задача' if requests.size > 0
    end
end

class ValidateTimeSlotCar < ActiveModel::Validator
    def validate(record)
        requests = Request.where('plan_started_at < ? AND plan_finished_at > ? AND car_id = ?',record.plan_finished_at-1.minutes, record.plan_started_at + 1.minutes, record.car_id)
        requests = requests.where('id != ?', record.id) if record.id.present?
        record.errors.add :plan_do_daterange, 'В указаное время транспорт зарезервирован' if requests.size > 0
    end
end

class ValidatePlanStartedAt < ActiveModel::Validator
    def validate(record)
        date_limit = (record.created_at || Time.now) - 1.minute
        if record.plan_started_at.present? && record.plan_started_at < date_limit
            record.errors.add :plan_do_daterange, 'Время начала не может быть раньше времени создания задачи'
        end
    end
end

# class ValidatePlanStartedAt < ActiveModel::Validator
#     def validate(record)
#         date_limit = record.created_at || Time.now
#         # return if record.request_type&.name == "Сервис" && record.request_subtype&.name == "Авария"
#         if record.plan_started_at.present? && record.plan_started_at < date_limit
#             record.errors.add :plan_do_daterange, 'Время начала не может быть раньше времени создания задачи'
#         end
#     end
# end

class PresencePlanDoDateRange < ActiveModel::Validator
    def validate(record)
        record.errors.add :plan_do_daterange, 'Время завершения должно быть установлено' unless record.plan_finished_at.present?
    end
end

class Request < ApplicationRecord
    TELEGRAM_BOT_TOKEN = '5412380128:AAFc2T24FyCd8QNvJ6QGaxNAG5aJQcXGYKg'
    TELEGRAM_CHAT_ID = '-641533410'

    validates_with PresencePlanDoDateRange, if: :do_validate_plan_datarange?
    validates :request_status_id,:request_type_id, :responsible_user_id, presence: true
    validates :request_first_reason_id, presence: true, if: :service_request?
    validates_with ValidateTimeSlotExecutor, if: :can_validate_executor_timeslot?
    validates_with ValidateTimeSlotCar, if: :can_validate_car_timeslot?
    validates :request_reason_id, presence: true, if: [:service_request?, Proc.new {|r| r.request_status.name == 'Закрыта'}]
    validates_with ValidatePlanStartedAt, unless: :request_is_plug?

    has_paper_trail skip: [:id, :created_at, :updated_at, :status_notified_at, :status_updated_at], versions: {
        scope: -> {order('created_at desc')}
    }

    has_many :documents, :as => :related_obj
    belongs_to :project
    belongs_to :resource, :polymorphic => true
    belongs_to :request_type
    belongs_to :request_subtype
    belongs_to :request_status
    belongs_to :request_reason
    belongs_to :request_first_reason
    belongs_to :responsible_user, class_name: "User"
    belongs_to :executor_user, class_name: "User"
    belongs_to :car, class_name: "User"
    belongs_to :helper_user, class_name: "User"

    has_many :children, class_name: "Request", foreign_key: "parent_id"
    # belongs_to :manager, class_name: "Employee", optional: true

    # after_create :send_request_creation_notification, unless: :request_is_plug?
    # after_create :send_create_notification, unless: :request_is_plug?
    after_commit :send_notification, on: [:create, :update], unless: :request_is_plug?
    before_save :add_plan_do_datarange, if: :can_auto_choose_datarange?
    after_update :update_debtor_by_request, if: :request_on_disconnect?

    def get_type_id
        self.request_type_id
    end

    def get_user_ids
        users_ids = []
        users_ids << self.executor_user_id if self.executor_user_id.present?
        users_ids << self.responsible_user_id
        # if self.request_type&.name == 'Эксплуатация сети'
        # self.project.project_managers_ids.each{|item| users_ids << item.to_i} if self.project_id.present?
        users_ids
    end

    def update_helpers
        children = self.children
        children_errors = []
        children.each do |child_request|
            child_request.update({
                request_type_id: self.request_type_id,
                request_status_id: self.request_status_id,
                resource_type: self.resource_type,
                resource_id: self.resource_id,
                request_reason_id: self.request_reason_id,
                responsible_user_id: self.responsible_user_id,
                description: self.description,
                comment: self.comment,
                plan_started_at: self.plan_started_at,
                plan_finished_at: self.plan_finished_at,
                status_updated_at: self.status_updated_at,
                status_notified_at: self.status_notified_at,
                request_subtype_id: self.request_subtype_id,
                request_first_reason_id: self.request_first_reason_id,
                project_id: self.project_id,
            })
            if child_request.errors.present?
                children_errors << [child_request.executor_user_id, child_request.errors]
            end
        end
        children_errors
    end

    def add_helper(user_id)
        request = self.children.create({
            request_type_id: self.request_type_id,
            request_status_id: self.request_status_id,
            resource_type: self.resource_type,
            resource_id: self.resource_id,
            request_reason_id: self.request_reason_id,
            responsible_user_id: self.responsible_user_id,
            description: self.description,
            comment: self.comment,
            plan_started_at: self.plan_started_at,
            plan_finished_at: self.plan_finished_at,
            status_updated_at: self.status_updated_at,
            status_notified_at: self.status_notified_at,
            request_subtype_id: self.request_subtype_id,
            request_first_reason_id: self.request_first_reason_id,
            project_id: self.project_id,
            executor_user_id: user_id,
        })
        request
    end

    def get_fields ()
        fields = {}
        fields['request_type'] = self.request_type&.name
        fields['request_subtype'] = self.request_subtype&.name
        fields['request_status'] = self.request_status&.name
        fields['responsible_user'] = self.responsible_user&.name
        fields['executor_user'] = self.executor_user&.name
        fields['car'] = self.car&.name
        fields['description'] = self.description
        fields['comment'] = self.comment
        fields['request_reason'] = self.request_reason&.description
        fields['request_first_reason'] = self.request_first_reason&.name
        fields['plan_started_at'] = self.plan_started_at&.strftime('%d.%m.%Y %H:%M:%S')
        fields['plan_finished_at'] = self.plan_finished_at&.strftime('%d.%m.%Y %H:%M:%S')
        fields['project'] = "#{self.project&.name} № #{self.project_id}"
        fields['resource'] = nil
        case resource_type
        when "LbAgreement"
            fields['resource'] = self.resource&.lb_account&.address_connect
        when "LbDevice"
            fields['resource'] = self.resource&.get_address
        end
        fields
    end

    def send_notification
        UserNotifier.create_notification(self)
    end

    # def send_create_notification
    #     payload = "<b>Создана задача № #{self.id}</b> \n"
    #     payload += "<b>Тип:</b> #{self.request_type.name} \n"
    #     payload += "<b>Статус:</b> #{self.request_status.name} \n"
    #     payload += "<b>Описание:</b> #{self.description} \n" if self.description.present?
    #     payload += "<b>Автор:</b> #{self.responsible_user.name} \n"
    #     Rails.logger.warn payload
    #     send_telegram_notification(self.responsible_user, payload)
    # end

    # def send_telegram_notification(user, payload)
    #     return unless user.chat_id.present? && payload.present?
    #     SendTelegramNotificationJob.perform_later(user.chat_id, payload)
    # end

    def request_on_disconnect?
        reason = self.request_first_reason
        return reason.present? && reason.name == 'Отключение ТВ. Должник' && self.request_status.name == 'Закрыта'
    end

    def update_debtor_by_request
        debtor = Debtor.find_by(request_id: self.id)
        return unless debtor.present?
        reason = self.request_reason
        if reason && (reason.description == "Нет доступа" || reason.description == "Нет маркировки")
            debtor.update(status: :impossible)
        else
            debtor.update(status: :disconnected)
        end
    end

    # def send_request_creation_notification
    #     payload = "<b>Создана задача № #{self.id}</b> \n"
    #     payload += "<b>Тип:</b> #{self.request_type.name} \n"
    #     payload += "<b>Статус:</b> #{self.request_status.name} \n"
    #     payload += "<b>Описание:</b> #{self.description} \n" if self.description.present?
    #     if v = self.responsible_user.presence
    #         payload += "<b>Автор:</b> #{v.name} \n"
    #     end
    #     Rails.logger.warn payload
    #     send_message_telegram(payload)
    # end

    def self.send_status_alert
        requests = Request.includes(:request_status).where('request_statuses.alert_timer NOTNULL').references(:request_status)
        count = 0
        requests.each do |request|

            next if (!request.status_notified_at.nil?) || (request.request_status.after_finish? && !request.plan_finished_at.present?)

            alert_timer = request.request_status.alert_timer
            should_be_sent = (!request.request_status.after_finish?) ? request.status_updated_at + alert_timer.minutes : request.plan_finished_at + alert_timer.minutes
            # Rails.logger.warn "[Request № #{request.id}]"
            if (should_be_sent) < Time.now
                payload = "<b>Нарушение сроков реагирования!!! Задача № #{request.id}.</b> \n" +
                "<b>Истек лимит времени нахождения в статусе #{request.request_status.name}</b> \n"
                # request.send_message_telegram(payload)
                request.update_columns(status_notified_at: Time.now)
                count+=1
            end
            # payload=""
            # # if !request.status_notified_at.presence && (request.status_updated_at + (request.request_status.alert_timer/2).minutes) < Time.now
            # #     payload = "<b>Предупреждение! Задача № #{request.id}.</b> \n" +
            # #     "<b>До смены статуса осталось менее #{request.request_status.alert_timer/2} минут</b> \n"
            # #     request.update_column(:status_notified_at, Time.now)
            # # end
            # if request.status_notified_at.presence && (request.status_updated_at + (request.request_status.alert_timer).minutes) < Time.now
            #     payload = "<b>Нарушение сроков выполнения!!! Задача № #{request.id}.</b> \n" +
            #     "<b>Находилась в статусе #{request.request_status.name} более #{request.request_status.alert_timer} минут</b> \n"
            #     id_status_of_violation = request.request_type.request_statuses.find_by(priority: 0).id
            #     PaperTrail.request.whodunnit = 'System'
            #     request.update(request_status_id: id_status_of_violation, status_notified_at: nil)
            # end
            # if payload.present?
            #     request.send_message_telegram(payload)
            # end
        end
        Rails.logger.warn "[Отправлено #{count} уведомлений]"
    end

    # def send_message_telegram(payload)
    #     chat_id = TELEGRAM_CHAT_ID
    #     bot_token = TELEGRAM_BOT_TOKEN
    #     SendRequestNotificationJob.perform_later(payload, bot_token, chat_id)
    # end

    def do_validate_plan_datarange?
        status = self.request_status
        status.present? && status.after_finish?
    end

    def can_validate_executor_timeslot?
        self.plan_started_at.present? && self.plan_finished_at.present? && self.executor_user_id.present? &&
        (
            self.executor_user.role == 'service_engineer' ||
            self.executor_user.role == 'connect_engineer'
        )
    end

    def can_validate_car_timeslot?
        self.plan_started_at.present? && self.plan_finished_at.present? && self.car_id.present?
    end

    def can_auto_choose_datarange?
        self.executor_user_id.present? && self.executor_user.role == 'engineer' &&
        !(self.plan_finished_at.present?) &&
        self.request_status_id.present? && self.request_status.name == 'Закрыта'
    end

    def request_is_plug?
        request_type = self.request_type&.name
        request_type == 'Служебная' || request_type == 'Другое'
    end

    def service_request?
        request_type = self.request_type
        request_subtype = self.request_subtype
        request_type&.name == 'Сервис' && request_subtype&.name == 'Абонентский сервис'
    end

    def self.fix_monitoring_department_requests
        requests = Request.joins(:executor_user,:request_status,:request_type)
                          .where("users.role = 5 AND request_types.name = 'Сервис' AND request_statuses.name = 'Закрыта'")
                          .where(plan_started_at: nil, plan_finished_at: nil)
        requests.each{|record|
            st_date = record.created_at
            fn_date = st_date+1.minutes
            record.update(plan_started_at: st_date, plan_finished_at: fn_date)
        }
    end

    private

    def add_plan_do_datarange
        date = Time.new
        self.plan_started_at = date
        self.plan_finished_at = date+1.minutes
    end

end
