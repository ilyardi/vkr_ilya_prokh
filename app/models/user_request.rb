class UserRequest < ApplicationRecord
  # validates :name, :phone, :email, :address, presence: true
  validates :phone, presence: true

  after_commit :send_request, on: :create

  private

    def send_request
      UserRequestMailer.notify_email(id).deliver_later
    end
end
