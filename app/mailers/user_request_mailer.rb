class UserRequestMailer < ApplicationMailer

  def notify_email(id)
    @user_request = UserRequest.find(id)
    mail(subject: "Задачами №#{id} на подключение с сайта", to: 'info@teleset.plus')
    @user_request.update(sent: true)
  end

end
