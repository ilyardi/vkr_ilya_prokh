module Site
  module V4
    class ProfilesController < Site::V4::BaseController
      def show
        @current_agreement = current_abonent.current_dogovor
      end

      def update
        @user = current_abonent
        if @user.email == user_params[:email] && @user.email.size > 0
          render json: {data: { validation: {email: ["Указанный электронный адрес уже подтвержден"]}}}
          return
        end
        
        if user_params[:email].present?
          @user.update(unconfirmed_email: user_params[:email])
          if @user.errors.size > 0
            render json: {data: { validation: @user.errors }}
            return
          end
          @user.send_email_confirmation!
        end


        current_agreement = @user.current_dogovor
        # if current_agreement.confirmed?
        accept = user_params[:accept]
        manual_delivery = user_params[:manual_delivery]
        if manual_delivery.nil?
          manual_delivery = current_agreement.lb_account.from_bill_delivery[:manual_delivery]
        end

        current_agreement.lb_account.set_bill_delivery(email: accept, receipt: manual_delivery)
        # end
      end

      def update_phone
        @phone_number = phone_params[:phone].gsub(/[^\d]/,"")

        if Abonent.find_by(phone: @phone_number)
          render json: { validation: { phone_confirmation: { base: ["Указанный номер телефона уже используется"] }}}
          return
        end

        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :update_phone)
        if @confirmation.errors.size > 0
          render json: { validation: { phone_confirmation: @confirmation.errors } }
          return
        end

        render json: { phone_confirmation: { phone: @confirmation.phone }}

        # Old------------------------------------------------------------
        # ActiveRecord::Base.transaction do
        #   user = Abonent.find_by(phone: phone_params[:phone])

        #   if user && user.confirmed_at
        #     @phone_confirmation = PhoneConfirmation.new
        #     @phone_confirmation.errors.add(:phone, I18n.t("errors.messages.taken"))
        #     raise ActiveRecord::Rollback
        #     return
        #   end

        #   user.destroy if user

        #   confirmation = PhoneConfirmation.find_by(phone: phone_params[:phone])
        #   confirmation.destroy if confirmation

        #   current_confirmation = current_abonent.phone_confirmation
        #   current_confirmation.destroy if current_confirmation

        #   @phone_confirmation = current_abonent.build_phone_confirmation(phone_params)
        #   unless @phone_confirmation.send_code
        #     raise ActiveRecord::Rollback
        #     return
        #   end
        # end
      end

      def confirm_phone
        phone_number = params[:phone].gsub(/[^\d]/,"")
        confirmation = PhoneConfirmation.where('expire_at > now()').find_by(phone: phone_number, code: params[:code])

        if confirmation.nil? || (confirmation.expire_at < Time.now)
            render json: { validation: { phone_confirmation: { code: [I18n.t("site.v1.phone_confirmations_controller.confirm.failed")]}}}
            return
        end

        PhoneConfirmation.where(["phone = ?", confirmation.phone]).destroy_all

        if confirmation.action == "update_phone"
            abonent = current_abonent
            abonent.update(phone: confirmation.phone)
            if abonent.errors.size > 0
                render json: { validation: { phone_confirmation: { code: ["Ошибка при обновлении номера телефона"]}}}
                return
            end
        end

        render json: { phone_confirmation: {phone: confirmation.phone} }

        # Old------------------------------------------------------------
        # @user = current_abonent
        # @phone_confirmation = PhoneConfirmation.find_by(phone: params[:phone], code: params[:code])
        # if @phone_confirmation
        #   @user.update_attributes(phone: params[:phone])
        #   @phone_confirmation.destroy
        # end
      end

      def update_password
        # Old------------------------------------------------------------
        # @user = current_abonent
        # @user.validate_password = true
        # if !@user.authenticate(params[:user][:old_password])
        #   @user.errors.add(:old_password, 'неверный пароль')
        #   render action: :update and return
          # render json: {validation: {user: {old_password: ['неверный пароль']}}}
        # end
        # @user.update_attributes(password_params)

        render json: { validation: { user: { base: ["Поддержка выполнения действий в системе по логину/паролю, прекращена"]}}}
      end


      private

        def user_params
          params.require(:user).permit(:login, :email, :accept, :manual_delivery)
        end

        def password_params
          params.require(:user).permit(:password, :password_confirmation)
        end

        def phone_params
          params.require(:phone_confirmation).permit(:phone)
        end
    end
  end
end
