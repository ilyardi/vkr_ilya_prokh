module Site
  module V4
    class RegistrationsController < Site::V4::BaseController
      skip_before_action :authenticate_abonent

      def create
        render json: {
          validation: {
            phone: ["Регистрация не требуется. Выполните вход по номеру телефона."]
          }
        }
        return

        @phone_number = user_params[:phone].gsub(/[^\d]/,"")

        # if Abonent.exists?(phone: @phone_number)
        #   render json: { validation: { base: ["Указанный номер телефона уже используется"] }}
        #   return
        # end

        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :login)
        if @confirmation.errors.size > 0
          render json: { validation: @confirmation.errors }
          return
        end

        render json: { data: { user: { login: user_params[:login], phone: @phone_number}}}
        return


        # Old---------------------------------------------------------------------
        # ActiveRecord::Base.transaction do

        #   @user = Abonent.find_by(phone: user_params[:phone], confirmed_at: nil)
        #   @user && @user.destroy # need for skip validations on accept and email

        #   @user = Abonent.new(user_params)
        #   @user.validate_phone_presence = true

        #   unless @user.update_columns(user_params)
        #     render json: {validation: @user.errors}
        #     raise ActiveRecord::Rollback
        #   end

        #   @confirmation = PhoneConfirmation.find_or_initialize_by(phone: user_params[:phone])
        #   @confirmation.user_id = @user.id

        #   unless @confirmation.send_code
        #     render json: {validation: {base: @confirmation.errors["base"]}}
        #     raise ActiveRecord::Rollback
        #   end
        # end
      end

      def confirm
        phone_number = params[:phone].gsub(/[^\d]/,"")
        confirmation = PhoneConfirmation.where('expire_at > now()').find_by(phone: phone_number, code: params[:code])

        if confirmation.nil? || (confirmation.expire_at < Time.now)
            render json: { error: "Код не существует или устарел"}
            return
        end

        PhoneConfirmation.where(["phone = ?", confirmation.phone]).destroy_all

        if confirmation.action == "login"
          abonent = Abonent.find_or_create_by(phone: phone_number)
          session[:abonent_id] = abonent.id
          render json: { data: { user: { address: {}, confirmed_at: Time.now, id: abonent.id }}}
          return
        end

        render json: { error: "Операция не выполненна"}
        return

        # Old----------------------------------------------------------------------------------
        # @confirmation = PhoneConfirmation.find_by(phone: params[:phone], code: params[:code])

        # if @confirmation
        #   @confirmation.user.update_column(:confirmed_at, Time.now)
        #   session[:user_id] = @confirmation.user_id
        #   @confirmation.destroy
        #   render and return
        # end
        # render json: {error: "Неверный код"}
      end


      # New------------------Рабочий код под новую схему, нехватает только кнопки в приложении.
      # def resend_code
      #   @phone_number = user_params[:phone].gsub(/[^\d]/,"")

      #   if Abonent.find_by(phone: @phone_number)
      #     render json: { validation: { phone_confirmation: { base: ["Указанный номер телефона уже используется"]}}}
      #     return
      #   end

      #   @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :login)
      #   if @confirmation.errors.size > 0
      #     render json: { validation: { phone_confirmation: @confirmation.errors}}
      #     return
      #   end
      #   render json: { data: { success: true }}
      #   return
      # end

      # Old--------------------Был закоментирован изначально, куда отправлется запрос на повторную отправку, не понятно
      # def resend_code
      #   @confirmation = PhoneConfirmation.find_by(phone: params[:phone])
      #   @confirmation.regenerate_code if @confirmation.persisted?
      #   @confirmation.save
      #   @confirmation.send_code

      #   # if @confirmation.can_send?
      #   #   render json: {
      #   #     error: "Следующая отправка возможна через #{Time.now.to_i - @confirmation.next_send_time.to_i} секунд",
      #   #     confirmation: {
      #   #       expire_at: @confirmation.expire_at.to_i,
      #   #       next_send_time: @confirmation.next_send_time.to_i
      #   #     }
      #   #   }
      #   # else
      #   #   @confirmation.send_code
      #   # end
      # end

      private

        def user_params
          params.require(:user).permit(
            :login,
            :password,
            :password_confirmation,
            :phone,
            :email,
            :accept
          )
        end
    end
  end
end
