module Site
  module V4
    class SessionsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent, except: [:destroy]

      def login
        render json: { error: "Вход по логину/паролю прекращен. Теперь вход доступен только по номеру телефона."}
      end

      def phone
        @phone_number = phone_params[:phone].gsub(/[^\d]/,"")

        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :login)
        if @confirmation.errors.size > 0
          render json: {
            error: @confirmation.errors.full_messages.join(", "),
            errors: @confirmation.errors # возвращение ошибки по новому, предыдущее оставлено для совместимости
          }
          return
        end

        render json: { phone: @phone_number }
      end

      def confirm
        phone_number = confirm_params[:phone].gsub(/[^\d]/,"")
        confirmation = PhoneConfirmation.where('expire_at > now()').find_by(phone: phone_number, code: confirm_params[:code])

        if confirmation.nil? || (confirmation.expire_at < Time.now)
            render json: {
              error: "Код не существует или устарел",
              errors: {
                base: "Код не существует или устарел",
              }
            }
            return
        end

        PhoneConfirmation.where(["phone = ?", confirmation.phone]).destroy_all

        @abonent = Abonent.find_or_create_by(phone: phone_number)
        if @abonent
          set_device_user(@abonent.id)
          session[:abonent_id] = @abonent.id
          render and return
        end

        render json: {
          error: @abonent.errors.full_messages.join(', '),
          errors: @abonent.errors,
        }
      end

      def destroy
        session.clear
        if params[:device_token].present? && (phone_device = PhoneDevice.find_by(device_token: params[:device_token]))
          phone_device.abonent_id = nil
          phone_device.save
        end
        render json: { success: true }
      end

      private

        def login_params
          params.require(:user).permit(:login, :password)
        end

        def phone_params
          params.require(:user).permit(:phone, :code)
        end

        def confirm_params
          if params[:user]
            params.require(:user).permit(:phone, :code)
          else
            params.require(:session).permit(:phone, :code)
          end
        end

        def set_device_user(user_id)
          if params[:user]
            device_token = params[:user][:device_token]
            if device_token.present?
              phone_device = PhoneDevice.find_or_initialize_by(device_token: device_token, platform: params[:user][:platform])
              phone_device.abonent_id = user_id
              phone_device.save
            end
          end
        end
    end
  end
end
