class Notification < ApplicationRecord
  enum status: { created: 1, readed: 2 }

  belongs_to :recipient, polymorphic: true
  # Не работает без Rpush
  has_many :phone_notifications, class_name: 'Rpush::Notification', foreign_key: :external_notification_id

  validates :notification_type, inclusion: { in: ['bill', 'info', 'news', 'lotto'], message: :invalid }

  scope :ordered, -> { order('created_at DESC') }

  def title
    if self.notification_type == 'bill'
      "Счет на оплату за #{self.data['date']}"
    else
      self.data['title']
    end
  end

  def body
    if self.notification_type == 'bill'
      "К оплате #{self.data['amount']} руб."
    else
      self.data['body']
    end
  end

  def send_to_devices
    case recipient.class.name
    when 'Abonent'
      recipient.phone_devices.active.each do |pd|
        send_to_device(pd)
      end
      # send_to_teledom()
    when 'PhoneDevice'
      send_to_device(self.recipient) if self.recipient.active?
    end
  end

  def send_to_device(pd)
    pd.send_push(
      notification_id: self.id,
      notification_type: self.notification_type,
      title: self.title,
      body: self.body,
      data: self.data,
    )
  end

  def send_to_teledom
    return unless self.recipient_type == "Abonent"
    dom_api = Teledom::Api.new
    res = dom_api.send_notification(self.recipient.phone, self.title, self.body)
  end

  def async_send
    SendNotification.set(wait: 1.seconds).perform_later(self.id)
  end

  class << self
    def create_test_bill(abonent)
      return if abonent.nil?

      address = abonent.dogovors.sample
      data = {
        address: "#{address.street} #{address.building}-#{address.flat}",
        balance: -140,
        amount: 160,
        dogovor: 9991390,
        date: I18n.l(Date.today, format: '%B %Y'),
      }
      create(recipient: abonent, notification_type: 'bill', status: 'created', data: data)
    end

    def create_test_info(obj)
      data = {
        title: "Работы по модернизации сети",
        body: "Уважаемые абоненты! 19 февраля 2020г. с 03:00 до 04:00 будут проводиться работы по модернизации ядра сети. Возможны перерывы в предоставлении доступа к сети Интернет. По всем вопросам просьба обращаться в нашу службу технической поддержки по тел.: 217-08-80 или через мобильное приложение «Телесеть» (доступно в AppStore и PlayМаркет) Приносим извинения за доставленные неудобства.",
      }
      create(recipient: obj, notification_type: 'info', status: 'created', data: data)
    end

    def create_news(obj, article, title:, body:)
      data = {
        title: title || article.title,
        body: body,
        article_id: article.id
      }
      create(recipient: obj, notification_type: 'news', status: 'created', data: data)
    end

    def create_bonus(abonent, bonus)
      data = {
        title: "Начислены бонусы за оплату",
        body:  "Вам начислено #{bonus.amount} бонусов за оплату. Спасибо, что Вы с нами!",
      }
      create(recipient: abonent, notification_type: 'info', status: 'created', data: data)
    end

    def create_spend_bonus(abonent, bonus)
      data = {
        title: "Бонусный платеж",
        body:  "Произведено списание #{bonus.amount.abs} бонусов в счет абонентской платы. Спасибо, что Вы с нами!",
      }
      create(recipient: abonent, notification_type: 'info', status: 'created', data: data)
    end

    def create_bonus_correction(abonent, bonus)
      data = {
        title: "Корректировка бонусов",
        body:  "Произведена корректировка бонусов на сумму #{bonus.amount}. Спасибо, что Вы с нами!",
      }
      create(recipient: abonent, notification_type: 'info', status: 'created', data: data)
    end

    def create_info(obj, title:, body:)
      data = {
        title: title,
        body: body,
      }
      create(recipient: obj, notification_type: 'info', status: 'created', data: data)
    end
  end
end
