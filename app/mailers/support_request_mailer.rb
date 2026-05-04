class SupportRequestMailer < ApplicationMailer

  def notify_email(id)
    @support_request = SupportRequest.find(id)
    mail(subject: "Задачами на поддержку №#{id} с сайта", to: 'info@teleset.plus')
    @support_request.update(sent: true)
  end

end
