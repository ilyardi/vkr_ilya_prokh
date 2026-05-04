module Site
    module V1
        class PhoneConfirmationController < Site::V1::BaseController
            skip_before_action :authenticate_abonent

            def confirm
                phone_number = confirm_params[:phone].gsub(/[^\d]/,"")
                confirmation = PhoneConfirmation.where('expire_at > now()').order(created_at: :desc).find_by(phone: phone_number, code: confirm_params[:code])

                if confirmation.nil? || (confirmation.expire_at < Time.now)
                    render json: { validation: { code: ["Код не существует или устарел"] } }
                    return
                end

                PhoneConfirmation.where(["phone = ?", confirmation.phone]).destroy_all

                if confirmation.action == "login"
                    abonent = Abonent.find_or_create_by(phone: phone_number)
                    dogovors = abonent.dogovors.pluck(:agrm_id)
                    phone = abonent.phone
                    # accounts = LbAccount.where("phone = #{phone} or mobile = #{phone} or fax = #{phone}").pluck(:uid)
                    # lb_agreements = LbAgreement.joins(:lb_account).where("accounts.phone = #{phone} or accounts.mobile = #{phone} or accounts.fax = #{phone}").pluck(:agrm_id)
                    # to do Ужесточить выборку, осуществлять поиск только по действующим учеткам, что бы был активный тариф
                    missed_lb_agreements = LbAgreement.joins(:lb_account).where("accounts.phone = #{phone} and agreements.archive = 0").where.not(agrm_id: dogovors)
                    ActiveRecord::Base.transaction do
                        missed_lb_agreements.each do |agrm|
                            account_address = agrm.lb_account.address_connect(as_hash: true)
                            abonent.dogovors.update_all(default: false)
                            address_attrs = {
                                confirmed: true,
                                default: true,
                            }
                            address_attrs.merge!(account_address)
                            address = abonent.dogovors.new(agrm_id: agrm.agrm_id)
                            raise ActiveRecord::Rollback unless address.update(address_attrs)
                            LbTelesetAgreement.find_or_create_by(agrm_id: agrm.agrm_id)
                        end
                    end
                    session[:abonent_id] = abonent.id
                end

                if confirmation.action == "update_phone"
                    abonent = current_abonent
                    abonent.update(phone: confirmation.phone)
                    if abonent.errors.size > 0
                        render json: { validation: abonent.errors }
                        return
                    end
                end

                render json: { success: true }
            end

            private

            def confirm_params
                params.require(:confirmation).permit(:phone, :code)
            end
        end
    end
end
