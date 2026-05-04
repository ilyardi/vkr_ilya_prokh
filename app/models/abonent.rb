class Abonent < ApplicationRecord

  has_many :phone_confirmations, dependent: :destroy
  has_many :dogovors, dependent: :destroy
  has_many :notifications, as: :recipient, dependent: :destroy
  has_many :phone_devices, dependent: :destroy
  has_many :auto_payment_methods, dependent: :destroy

  # has_many :lb_agreements, through: :dogovors

  validates :phone, uniqueness: true, format: { with: /\A7[\d]{10}\z/ }

  # validates :email, presence: true, on: :update
  # validates :email, email: true, on: :update
  validates :unconfirmed_email, email: {mode: :strict}, allow_nil: true

  def current_dogovor
      return self.dogovors.not_blocked.find_by(default: true) || self.dogovors.not_blocked.first
  end

  def send_email_confirmation!
    return unless self.unconfirmed_email

    new_token = SecureRandom.hex(24)
    self.update_column(:confirmation_token, new_token)
    AbonentMailer.email_confirmation(self.id).deliver_later
  end

  def confirm_email!
    self.update_columns(email: self.unconfirmed_email, unconfirmed_email: nil, confirmation_token: nil)
  end

  def send_phone_confirmation!(new_phone)
    conf = PhoneConfirmation.new

    if Abonent.exists?(phone: new_phone)
      conf.errors.add(:base, "Телефон уже существует")
    else
      conf = PhoneConfirmation.create_confirmation(phone, :update_phone)
    end

    conf
  end

  def can_view_camera?(camera)
    return true if camera.free?

    agrms = camera.camera_agreements.pluck(:agrm_id)

    self.dogovors.confirmed.each do |a|
      if agrms.include?(a.agrm_id)
        return true
      end

      if a.street == camera.street && a.building == camera.building
        return true
      end
    end

    return false
  end
end

class EmailValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    unless value =~ /\A([^@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})\z/i
      record.errors.add attribute, (options[:message] || "Не корректный email")
    end
  end
end
