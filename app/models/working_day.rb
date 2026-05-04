class WorkingDay < ApplicationRecord
  has_paper_trail versions: {
    scope: -> {order('created_at desc')}
  }

  before_destroy :check_requests_on_day
  after_create :create_plug_requests, if: :make_plug?
  belongs_to :user

  scope :by_month_in_date, ->(date) { where(date: date.beginning_of_month..date.end_of_month) }

  private

  def make_plug?
    permissible_department = ['service_department', 'connection_department', 'exploitation_department']
    permissible_department.include?(self.user.department&.name)
  end

  def check_requests_on_day
    request_descs = ['Обед', 'Получение документов', 'Доставка документов', 'Нерабочее время']
    requests = Request.where(executor_user_id: self.user_id, plan_started_at: self.date.beginning_of_day..self.date.end_of_day)
    requests.each do |request|
      if !request_descs.include?(request.description)
        self.errors.add(:base, "Есть неоткрепленные задачи!")
        raise ActiveRecord::Rollback
      end
      request.destroy
    end
  end

  def create_plug_requests
    request_type = RequestType.find_by(name: 'Служебная')
    request_type_by_dinner = RequestType.find_by(name: 'Другое')
    if request_type && !(self.user.role == 'connect_engineer')
      Request.create(
        request_type_id: request_type.id,
        request_status_id: request_type.request_statuses.find_by(priority: 1).id,
        responsible_user_id: self.user_id,
        executor_user_id: self.user_id,
        plan_started_at: self.date.to_time.change(hour: 9, min: 0, sec:0),
        plan_finished_at: self.date.to_time.change(hour: 10, min: 0, sec:0),
        description: 'Получение документов',
      )
    end
    # if request_type && self.user.role == 'connect_engineer'
    #   Request.create(
    #     request_type_id: request_type.id,
    #     request_status_id: request_type.request_statuses.find_by(priority: 1).id,
    #     responsible_user_id: self.user_id,
    #     executor_user_id: self.user_id,
    #     plan_started_at: self.date.to_time.change(hour: 18, min: 0, sec:0),
    #     plan_finished_at: self.date.to_time.change(hour: 21, min: 0, sec:0),
    #     description: 'Нерабочее время',
    #   )
    # end
    if request_type_by_dinner
      dinner_time = 13
      Request.create(
        request_type_id: request_type_by_dinner.id,
        request_status_id: request_type_by_dinner.request_statuses.find_by(priority: 1).id,
        responsible_user_id: self.user_id,
        executor_user_id: self.user_id,
        plan_started_at: self.date.to_time.change(hour: dinner_time, min: 0, sec:0),
        plan_finished_at: self.date.to_time.change(hour: dinner_time+1, min: 0, sec:0),
        description: 'Обед',
      )
    end
  end
end
