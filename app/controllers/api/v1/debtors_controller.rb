module Api
    module V1
        class DebtorsController < BaseController
            load_and_authorize_resource

            def index
                filter = params[:filter] || {}
                date = filter[:month] ? Time.parse(filter[:month]) : Time.now()
                date = date-1.month
                agrm_type = filter[:agrm_type].presence || 'tv'

                debtors_static = Debtor.where(created_at: date.beginning_of_month..date.end_of_month, agrm_type: agrm_type)
                debtors_static = debtors_static.where(status: filter[:status]) if filter[:status].present?
                debtors_from_last = debtors_static.where(status: "disconnected", request_id: nil)
                total_request_ids = debtors_static.where("request_id IS NOT NULL").map{|record| record.request_id}

                @total_debtors          = debtors_static.size
                @total_sum              = 0
                @total_count_request    = 0
                @total_sum_current      = 0
                @total_debtors_current  = 0
                @total_request_is_done  = 0
                @debtors_from_last      = debtors_from_last.size
                @sum_from_last          = debtors_from_last.sum(&:balance)

                debtor_ids = debtors_static.map { |record|
                    @total_sum           += record.balance
                    @total_count_request += 1 if record.request_id.present?
                    record.agrm_id
                }
                @debtor_by_agrm      = debtors_static.index_by(&:agrm_id)
                @agreements_with_lan = {}

                @total_request_is_done = Request.joins(:request_status).where(
                    "requests.id IN (?) AND request_statuses.name = 'Закрыта'",
                    total_request_ids
                ).size

                # === ДЕМО-РЕЖИМ: без LanBilling. Должники строятся
                # из локальной таблицы Debtor + Agreement через DemoLbAgreement.
                agreements_index = Agreement.where(external_id: debtor_ids).index_by(&:external_id)
                decorators = debtor_ids.map { |aid|
                    agreement = agreements_index[aid]
                    debtor    = @debtor_by_agrm[aid]
                    next unless agreement && debtor
                    DemoLbAgreement.new(agreement, debtor)
                }.compact

                # Простые in-memory фильтры
                if filter[:phone].present?
                    decorators = decorators.select { |d| d.lb_account.mobile.to_s.include?(filter[:phone].to_s) }
                end
                if filter[:number].present?
                    decorators = decorators.select { |d| d.number.to_s.include?(filter[:number].to_s) }
                end

                @total_debtors_current = decorators.size
                @total_sum_current     = decorators.sum(&:balance)

                @debtors = Kaminari.paginate_array(decorators).page(page_param).per(per_param)
            end

            def update
                @debtor = Debtor.find(params[:id])
                @debtor.update(debtor_params)
                set_bad_request(@debtor)
            end

            private

            def debtor_params
                params.require(:debtor).permit(
                    :request_id,
                )
            end

            def set_bad_request(model)
                if model.errors.size > 0
                    render status: :bad_request
                end
            end
        end
    end
end
