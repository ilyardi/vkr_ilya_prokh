module Site
    module V1
        class EmailConfirmationController < Site::V1::BaseController
            skip_before_action :authenticate_abonent, except: [:resend]
            def confirm
                @abonent = Abonent.find_by(confirmation_token: params[:token])
                @abonent.confirm_email! if @abonent
                redirect_to Settings.lk_host
            end

            def resend
                current_abonent.send_email_confirmation!
            end
        end
    end
end
