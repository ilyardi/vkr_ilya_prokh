class SendLbPhoneEmailJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[SendLbPhoneEmailJob] #{exception.message}"
  end

  def perform(agrm_id:, email:, phone:)
    agreement = LbAgreement.find_by(agrm_id: agrm_id)
    return unless agreement

    emails = [
      agreement.lb_account.email.presence,
      agreement.lb_account.email&.include?(email) ? nil : email
    ].compact.uniq

    agreement.lb_account.update(
      email: emails.join(","),
      fax: phone
    )
  end
end
