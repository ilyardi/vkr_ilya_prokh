module Api
    module V1
        class BonusChargesController < BaseController
          load_and_authorize_resource

          def rollback_charge
            rollbackable_charge = BonusCharge.find(params[:id])
            unless rollbackable_charge.present?
              render status: :bad_request
              return
            end
            @charge = BonusCharge.create(agrm_id: rollbackable_charge.agrm_id, amount: -1*rollbackable_charge.amount, comment: "Откат транзакции № #{rollbackable_charge.id}")
          end
        end
    end
end
