module Site
  module V1
    class SessionsController < Site::V1::BaseController
      skip_before_action :authenticate_abonent, except: [:destroy]

      def create
        @phone_number = phone_params[:phone].gsub(/[^\d]/,"")
        # Rails.logger.warn "[Phone] #{@phone_number}"
        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :login)
        if @confirmation.errors.size > 0
          render json: { errors: @confirmation.errors }
          return
        end
        phone = @confirmation.phone.gsub(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+\1(\2)-\3-\4-\5')
        help_text = "Для подтверждения номера #{phone} отправлен звонок, введите последние 4-е цифры звонящего номера"
        help_text = "Введите код из СМС, отправленный на номер #{phone}" if @confirmation.service_type != "call"
        render json: { success: true, help_text: help_text }
      end

      def destroy
        session.delete(:abonent_id)
      end

      private

      def phone_params
        params.require(:abonent).permit(:phone)
      end
    end
  end
end
