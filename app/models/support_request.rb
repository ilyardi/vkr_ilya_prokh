class SupportRequest < ApplicationRecord
  after_commit :send_request, on: :create

  private

    def send_request
      SupportRequestMailer.notify_email(id).deliver_later
    end
end
