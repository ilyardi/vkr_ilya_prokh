class PhoneDevice < ApplicationRecord
  enum platform: { ios: 1, android: 2 }
  validates :device_token, presence: true
  validates :device_token, uniqueness: { scope: :platform }

  belongs_to :abonent
  has_many :notifications, as: :recipient, dependent: :destroy

  scope :active, -> { where(active: true) }
  # validates :platform, inclusion: { in: platforms, message: :invalid }

  def notifications
    tn = Rpush::Notification.table_name
    Notification.joins(:phone_notifications).where(tn => { external_phone_device_id: self.id})
  end

  def rpush_notifications
    Rpush::Notification.where(external_phone_device_id: self.id)
  end

  # permission_infos, permission_bills, permission_lotto
  def send_push(opts = {})
    return unless self.active?

    notification_id = opts[:notification_id]
    notification_type = opts[:notification_type]
    data = opts[:data]
    title = opts[:title]
    body = opts[:body]

    return if !self.permission_bills && notification_type == 'bill'
    return if !self.permission_infos && notification_type == 'news'
    return if !self.permission_infos && notification_type == 'info'
    return if !self.permission_lotto && notification_type == 'lotto'

    # case self.platform
    # when 'android' then
    app = Rpush::Fcm::App.find_by_name("teleset-plus")
    return if app.nil?
    # return if !notification_id.nil? && Rpush::Gcm::Notification.exists?(external_notification_id: notification_id, app: app)

    n = Rpush::Fcm::Notification.new
    n.external_notification_id = notification_id
    n.external_phone_device_id = self.id
    n.app = app
    n.device_token = self.device_token
    n.registration_ids = [self.device_token]
    n.data = data
    n.priority = (notification_type == 'bill') ? 'high' : 'normal'
    n.content_available = true
    n.notification = { body: body, title: title }
    n.save!
    # when 'ios' then
    #   Rails.logger.warn "TODO IOS PUSH SENDING"
    # end
  end
end

# module ActiveRecord
#   module Enum
#     class EnumType < Type::Value
#       def assert_valid_value(value)
#         unless value.blank? || mapping.has_key?(value) || mapping.has_value?(value)
#           nil
#         end
#       end
#     end
#   end
# end
