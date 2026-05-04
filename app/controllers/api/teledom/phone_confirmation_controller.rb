module Api
  module Teledom
    class PhoneConfirmationController < ::ActionController::API

      def create
        @phone_number = phone_params[:phone].gsub(/[^\d]/,"")
        @confirmation = PhoneConfirmation.create_confirmation(@phone_number, :login)
        if @confirmation.errors.size > 0
          render json: { success: false, errors: @confirmation.errors }
          return
        end
        phone = @confirmation.phone.gsub(/^(\d)(\d{3})(\d{3})(\d{2})(\d{2})$/, '+\1(\2)-\3-\4-\5')
        render json: { success: true, code: @confirmation.code }
      end

      private

      def confirm_params
          params.require(:confirmation).permit(:phone, :code)
      end

      def phone_params
        params.require(:abonent).permit(:phone)
      end
    end
  end
end
