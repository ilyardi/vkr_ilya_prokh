class TeledomRequest < ApplicationRecord
  acts_as_paranoid
  has_paper_trail skip: [:id, :created_at, :updated_at], versions: {
        scope: -> {order('created_at desc')}
    }

  enum status: { created: 'created', processing: 'processing', done: 'done' }
  enum subject: { connect: 'connect', disconnect: 'disconnect' }

  validates :phone, presence: true

  belongs_to :lb_agreement, foreign_key: :agrm_id
  belongs_to :user

  after_create_commit :create_notification

  def create_notification
    data = {
            title: "Новая заявка Телесеть.Дом",
            body: "<b>№ заявки:</b> #{self.id} \n" +
                  "<b>Телефон:</b> #{self.phone} \n" +
                  "<b>Тип заявки:</b> #{I18n.t("models.teledom_request.subjects.#{self.subject}")}"
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
