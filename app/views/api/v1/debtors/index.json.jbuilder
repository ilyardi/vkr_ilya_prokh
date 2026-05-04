# Демо-режим: без LanBilling. Тарифы подставляются как заглушки в .map ниже.
tariffs = {}
json.debtors do
    json.array! @debtors do |debtor|
        request = Request.find(@debtor_by_agrm[debtor.agrm_id].request_id) if @debtor_by_agrm[debtor.agrm_id].request_id
        json.id @debtor_by_agrm[debtor.agrm_id].id
        json.(debtor, :agrm_id, :number)
        json.current_balance debtor.balance
        json.balance @debtor_by_agrm[debtor.agrm_id].balance
        json.address debtor.lb_account.address_connect
        json.tariffs do
            json.array! @debtor_by_agrm[debtor.agrm_id].tar_ids.map { |tar_id|
                tariffs[tar_id.to_i]&.descr || "Демо-тариф ##{tar_id}"
            }
        end
        json.connections @agreements_with_lan[debtor.agrm_id]
        json.uid debtor.uid
        json.mobile debtor.lb_account.mobile
        json.phone debtor.lb_account.phone
        json.fax debtor.lb_account.fax
        json.fee @debtor_by_agrm[debtor.agrm_id].fee
        json.status @debtor_by_agrm[debtor.agrm_id].status
        json.request_id @debtor_by_agrm[debtor.agrm_id].request_id
        json.request_status request.present? ? request.request_status.name : nil
        json.demo defined?(DemoLbAgreement) && debtor.is_a?(DemoLbAgreement)
    end
end

r_type = RequestType.find_by(name: 'Сервис')
r_subtype = RequestSubtype.find_by(name: 'Внутренняя')
r_f_reason = RequestFirstReason.find_by(name: 'Отключение ТВ. Должник')

json.total_data do
    json.total_debtors @total_debtors
    json.total_sum @total_sum
    json.total_count_request @total_count_request
    json.total_debtors_current @total_debtors_current
    json.total_sum_current @total_sum_current
    json.total_request_is_done @total_request_is_done
    json.debtors_from_last @debtors_from_last
    json.sum_from_last @sum_from_last
end

json.predata_request do
    json.request_type_id          r_type&.id
    json.request_subtype_id       r_type&.request_subtypes&.find_by(name: 'Внутренняя')&.id
    json.request_status_id        r_type&.request_statuses&.find_by(name: 'Новая')&.id
    json.request_first_reason_id  r_f_reason&.id
end

json.meta do
    json.total @debtors.total_count
    json.page page_param
    json.per per_param
end
