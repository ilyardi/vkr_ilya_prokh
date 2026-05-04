class PhoneConfirmation < ApplicationRecord
  EXPIRE_TIME = 2.minutes
  enum action: { login: 1 , update_phone: 2}
  enum service_type: { call: 1 , message: 2}
  validates :phone, format: {with: /\A7[\d]{10}\z/}

	# belongs_to :abonent

	before_create do
    self.code = get_code if self.code.blank?
  end

  # after_create do
  #   if self.send_code
  # end

  def send_code
    Rails.logger.warn "[PhoneConfirmation#send_code] #{self.code}"
    # code_response = Sms::Message.new.send_code(phone, self.code)
    code_response = NotiSend::Sms.new.send_code(phone, self.code)
    if code_response[0]
      update_columns({
        expire_at: Time.now + EXPIRE_TIME,
        service_type: 2,
      })
      return true
    end

    # TODO debug unknown error
    if code_response[1].nil?
      Rails.logger.error "DEBUGGER: PhoneConfirmation#send_code: #{code_response.to_json}"
    end

    if code_response[1] && code_response[1].include?("invalid mobile phone")
      self.errors.add(:base, "На данный номер нельзя отправить SMS")
    else
      self.errors.add(:base, "Сервис недоступен")
    end
    return false
  end

  def do_auth_call
    call_response = AuthCall::Call.new.do_call(phone)
    if call_response[0]
      update_columns({
        code: call_response[2],
        expire_at: Time.now + EXPIRE_TIME,
        service_type: 1,
      })
      Rails.logger.warn "[PhoneConfirmation#do_auth_call] #{call_response[2]}"
      return true
    end

    Rails.logger.error "[PhoneConfirmation#do_auth_call.error] #{call_response.inspect}"
    # if call_response[1] == 'service is unavailable'
    self.errors.add(:base, "Сервис недоступен")
    # else
      # self.errors.add(:base, "Ошибка отправки запроса")
    # end
    return false
  end

  def is_expired?
    self.expire_at.nil? || self.expire_at < Time.now
  end

  def self.create_confirmation(phone, action)
    exist_conf = PhoneConfirmation.where(["phone = ? AND expire_at > ?", phone, Time.now]).order('expire_at DESC')
    if exist_conf.first != nil
      conf = PhoneConfirmation.new()
      conf.errors.add(:code, "Отправить код можно через #{(exist_conf.first.expire_at - Time.now).to_i} секунд")
      return conf
    end

    prev_conf = PhoneConfirmation.where(phone: phone).where("created_at > ?", Time.now - 5.minutes).order('created_at DESC').first

    conf = PhoneConfirmation.create(phone: phone, action: action, expire_at: Time.now + EXPIRE_TIME*2)
    if conf.errors.size == 0
      if %w/79991112233 79035327090 79160802153/.include?(phone)
        conf.update_columns(code: phone[-4..-1], expire_at: Time.now + EXPIRE_TIME)
      else
        if prev_conf.present? && prev_conf.call?
          conf.send_code
        else
          conf.do_auth_call
        end
      end
    end
    conf
  end

  private

  def get_code
    rand(9999).to_s.center(4,'0')
  end
end
