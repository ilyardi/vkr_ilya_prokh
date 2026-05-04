module Api
    module Teledom
        class IssuesController < ::ActionController::API
            def issue
                Rails.logger.warn "[TELEDOM_ISSUE] #{params.to_json}"
                if params[:issue][:assigned].present? && params[:issue][:assigned] == "callcenter" && params[:issue][:subject_type].present?
                    request_params = {
                        phone: params[:issue][:_cf_phone],
                        status: :created,
                        subject: params[:issue][:subject_type],
                        description: params[:issue][:subject],
                    }
                    lb_agreement = LbAgreement.joins(:lb_account).where("accounts.phone LIKE #{request_params[:phone]}").first
                    request_params[:agrm_id] = lb_agreement.agrm_id  if lb_agreement.present?
                    current_request = TeledomRequest.find_by(
                        phone: request_params[:phone],
                        created_at: (Time.now-7.day)..Time.now,
                        subject: request_params[:subject]
                    )
                    TeledomRequest.create(request_params) unless current_request.present?
                end
                render json: {id: SecureRandom.uuid}, status: 200
            end
        end
    end
end
