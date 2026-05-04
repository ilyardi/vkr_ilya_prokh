module Site
  module V1
    class ProfilesController < Site::V1::BaseController
      def show
        @current_dogovor = current_abonent.current_dogovor
      end

      # update only email and email_receipt flag
      def update
        @user = current_abonent

        # if update_params[:email].present? && (update_params[:email] != @user.unconfirmed_email)
        # if @user.email == update_params[:email] && @user.email.size > 0
        #   render json: {data: { validation: {email: ["Указанный электронный адрес уже подтвержден"]}}}
        #   return
        # end

        if @user.email != update_params[:email]
          @user.update(unconfirmed_email: update_params[:email])
          if @user.errors.size > 0
            render json: {data: { validation: @user.errors }}
            return
          end
          @user.send_email_confirmation!
        end

        if current_abonent.current_dogovor != nil
          accept = update_params[:accept]
          manual_delivery = update_params[:manual_delivery]
          if accept != nil || manual_delivery != nil
            current_abonent.current_dogovor.lb_account.update_bill_delivery(email: accept, receipt: manual_delivery)
          end
        end

        render :show
      end

      def update_phone
        # @user = current_abonent
        # conf = @user.send_phone_confirmation!(update_params[:phone])
        # if conf.errors.size > 0
        #   render json: { errors: conf.errors }
        # end
        @phone_number = update_params[:phone].gsub(/[^\d]/,"")
        # Rails.logger.warn "[Phone] #{@phone_number}"

        if Abonent.find_by(phone: @phone_number)
          render json: { validation: { phone: ["Указанный номер телефона уже используется"]}}
          return
        end

        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :update_phone)
        if @confirmation.errors.size > 0
          render json: { validation: @confirmation.errors }
          return
        end
        phone = @confirmation.phone.gsub(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+\1(\2)-\3-\4-\5')
        help_text = "Для подтверждения номера #{phone} отправлен звонок, введите последние 4-е цифры звонящего номера"
        help_text = "Введите код из СМС, отправленный на номер #{phone}" if @confirmation.service_type != "call"
        render json: { success: true, help_text: help_text }
      end

      private

        def update_params
          params.require(:user).permit(:email, :accept, :manual_delivery, :phone)
        end
    end
  end
end
