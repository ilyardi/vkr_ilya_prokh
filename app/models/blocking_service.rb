class BlockingService < ApplicationRecord
  acts_as_paranoid
  has_paper_trail skip: [:id, :created_at, :updated_at], versions: {
        scope: -> {order('created_at desc')}
    }

  scope :active, ->{where(active: true)}
  scope :blocked, ->{where(status: :blocked)}

  enum status: { created: 'created', processing: 'processing', blocked: 'blocked', unblocking: 'unblocking', done: 'done' }

  validates :agrm_id, :from_date, :to_date, presence: true

  belongs_to :lb_agreement, foreign_key: :agrm_id
  belongs_to :abonent

  before_save ->(blocking_service) {
    blocking_service.from_date = blocking_service.from_date.beginning_of_month unless blocking_service.from_date.blank?
    blocking_service.to_date = blocking_service.to_date.beginning_of_month unless blocking_service.to_date.blank?
  }
  after_create_commit :create_notification
  after_update_commit :unblocking_notification, if: Proc.new {|record| record.versions.first.object_changes["status"] && record.unblocking?}

  def unblocking_notification
    data = {
            title: "Необходима разблокировка",
            body: "<b>Договор:</b> #{self.lb_agreement.number} \n" +
                  "<b>Адрес:</b> #{self.lb_agreement.lb_account.address_connect} \n" +
                  "<b>№ блокировки:</b> #{self.id} \n" +
                  "<b>Дата завершения:</b> #{self.to_date.strftime("%Y-%m-%d")}"
        }
    send_notification(data, self.versions.first)
  end

  def create_notification
    data = {
            title: "Новая заявка на блокировку",
            body: "<b>Договор:</b> #{self.lb_agreement.number} \n" +
                  "<b>Адрес:</b> #{self.lb_agreement.lb_account.address_connect} \n" +
                  "<b>Блокировка:</b> #{self.id} \n" +
                  "<b>Дата начала:</b> #{self.from_date.strftime("%Y-%m-%d")}"
        }
    send_notification(data, self.versions.first)
  end

  def send_notification(data, version)
    user = User.find_by(name: 'Менеджеры')
    return unless user.present? && data.present? && version.present?
    notification = UserNotification.create(data: data, user_id: user.id, version_id: version.id)
    notification.send_telegram
  end
end
