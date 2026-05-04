class Expense < ApplicationRecord
  has_paper_trail skip: [:id, :created_at, :updated_at, :status_notified_at, :status_updated_at], versions: {
        scope: -> {order('created_at desc')}
    }

  enum pay_type: { cash: "cash", noncash: "noncash" }
  enum flow_rate: { opex: "opex", capex: "capex" }
  enum status: { at_work: "at_work", paid: "paid", done: "done", decline: "decline", plan: "plan" }

  validates :name, :amount, :expense_type_id, :expense_stage_id, :author_id, :pay_type, presence: true
  validates :plan_date_payment, presence: true, if: -> {repeatable}

  has_many :documents, :as => :related_obj
  has_one :expense_template
  belongs_to :author, class_name: "User"
  belongs_to :expense_type
  belongs_to :expense_stage
  belongs_to :expense_purpose
  belongs_to :expense_company
  belongs_to :expense_counterparty

  before_save :make_unread, if: Proc.new { |expense| expense.expense_stage_id_changed? }
  after_commit :expense_paid, if: -> {paid?}
  after_commit :expense_done, if: -> {done?}

  after_commit :send_notification, on: [:create, :update]

  def do_at_work
    start_stage = self.expense_type&.expense_stages&.order(:priority).second.id
    params = self.attributes
    params.shift
    params["status"] = "at_work"
    params["expense_stage_id"] = start_stage
    request = Expense.create(params)
    request
  end

  def make_unread
    self.checked_at = nil
  end

  def switch_checked
      new_checked_at = self.checked_at.nil? ? Time.now : nil
      self.update_column(:checked_at, new_checked_at)
      self
  end

  def send_notification
      UserNotifier.create_notification(self)
  end

  def last_stage?
    self.expense_type.expense_stages
  end

  def expense_paid
    data = {
      title: "Расход № #{self.id} Оплачен!",
      body: "Платеж по расходу \"#{self.name}\" выполнен."
    }
    version = self.versions.first
    return unless version.present?
    return unless version.object_changes["status"]&.last == "paid"
    user_ids = [self.author_id] | self.expense_type.expense_stages.pluck(:user_id).compact
    user_ids.uniq!
    user_ids.delete(version.whodunnit.to_i) if version.whodunnit.present?
    user_ids.each{ |user_id|
      notification = UserNotification.create(data: data, user_id: user_id)
      notification.send_telegram
    }
  end

  def expense_done
    data = ""
    data = "Платеж по расходу \"#{self.name}\" выполнен." if self.expense_stage.name.downcase.include?('оплата')
    data = {
      title: "Расход № #{self.id} завершен!",
      body: data
    }
    version = self.versions.first
    return unless version.present?
    return unless version.object_changes["status"]&.last == "done"
    user_ids = [self.author_id] | self.expense_type.expense_stages.pluck(:user_id).compact
    user_ids.uniq!
    user_ids.delete(version.whodunnit.to_i) if version.whodunnit.present?
    user_ids.each{ |user_id|
      notification = UserNotification.create(data: data, user_id: user_id)
      notification.send_telegram
    }
  end

  def get_type_id
      self.expense_type_id
  end

  def get_user_ids
      users_ids = [self.author_id]
      current_executor = self.expense_stage&.user_id
      users_ids << current_executor if current_executor.present?
      users_ids
  end

  def get_fields ()
      fields = {}
      fields['name'] = self.name
      fields['description'] = self.description
      fields['comment'] = self.comment
      fields['amount'] = self.amount
      fields['author'] = self.author&.name
      fields['expense_type'] = self.expense_type&.name
      fields['expense_stage'] = self.expense_stage&.name
      fields['pay_type'] = self.pay_type == "cash" ? "Наличный" : "Безналичный"
      fields['counterparty'] = self.counterparty
      fields['date_payment'] = self.date_payment&.strftime('%d.%m.%Y %H:%M:%S')
      fields['plan_date_payment'] = self.plan_date_payment&.strftime('%d.%m.%Y %H:%M:%S')
      fields['expense_purpose'] = self.expense_purpose&.name
      fields['flow_rate'] = self.flow_rate
      fields
  end

  def generate_template(unit:,quantity:)
    return false unless self.repeatable
    next_date = self.plan_date_payment.beginning_of_day
    case unit
    when 'month'
      next_date += quantity.month
    when 'day'
      next_date += quantity.day
    end
    expense_template = ExpenseTemplate.create(
      unit: unit,
      quantity: quantity,
      expense_date: next_date,
      expense_id: self.id
    )
    expense_template.errors.each do |error|
      self.errors.add(error.attribute, error.message)
    end
    expense_template
  end

  def current_executor
    executor = self.expense_stage.user
    executor ||= self.author
    executor
  end

  def try_approve(user_id)
    next_stage = self.expense_stage.get_next_stage
    unless next_stage.present?
      self.errors.add(:base, "Счет находится на последнем этапе согласования")
    end
    self.update(expense_stage_id: next_stage.id) if next_stage.present?
    self
  end

  def try_decline(user_id)
    prev_stage = self.expense_stage.get_prev_stage
    unless prev_stage.present?
      self.errors.add(:base, "Счет находится на начальном этапе согласования")
    end
    self.update(expense_stage_id: prev_stage.id) if prev_stage.present?
    self
  end

end
