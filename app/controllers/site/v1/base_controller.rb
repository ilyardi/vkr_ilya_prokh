module Site
  module V1
    class BaseController < ActionController::API
      include ActionController::Cookies

      before_action :set_user_from_teledom
      before_action :authenticate_abonent

      helper_method :current_abonent

      private
        def current_abonent
          @current_abonent ||= session[:abonent_id] && Abonent.find_by(id: session[:abonent_id])
        end

        def authenticate_abonent
          render json: { error: I18n.t('site.v1.base.unauthorized') }, status: 401 unless current_abonent
        end

        def set_user_from_teledom
          return if @current_abonent

          if token = params[:teledom_autoauth]
            if teledom_user = TeledomUser.find_by(auth_token: token)
              if @current_abonent = Abonent.find_or_create_by(phone: teledom_user.attributes['id'])
                dogovors = @current_abonent.dogovors.pluck(:agrm_id)
                phone = @current_abonent.phone
                missed_lb_agreements = LbAgreement.joins(:lb_account).where("accounts.phone = #{phone} and agreements.archive = 0").where.not(agrm_id: dogovors)
                ActiveRecord::Base.transaction do
                    missed_lb_agreements.each do |agrm|
                        account_address = agrm.lb_account.address_connect(as_hash: true)
                        @current_abonent.dogovors.update_all(default: false)
                        address_attrs = {
                            confirmed: true,
                            default: true,
                        }
                        address_attrs.merge!(account_address)
                        address = @current_abonent.dogovors.new(agrm_id: agrm.agrm_id)
                        raise ActiveRecord::Rollback unless address.update(address_attrs)
                        LbTelesetAgreement.find_or_create_by(agrm_id: agrm.agrm_id)
                    end
                end
                session[:abonent_id] =  @current_abonent.id
              end
            end
          end
        end
    end
  end
end
