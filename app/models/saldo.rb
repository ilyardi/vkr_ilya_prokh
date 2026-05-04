require 'bigdecimal'

class Saldo < LbBase
  self.primary_key = :saldo_id
  self.table_name = :teleset_saldos

  belongs_to :lb_agreement, foreign_key: :agrm_id

  PAYMENT_SERVICE_TYPE_INTERNET = 'internet'
  PAYMENT_SERVICE_TYPE_TV = 'tv'
  PAYMENT_SERVICE_TYPE_VIDEO = 'video'
  PAYMENT_SERVICE_TYPE_UD = 'ud'
  PAYMENT_SERVICE_TYPE_TO_DOM = 'to_dom'

  # 6.times{|i| d = Date.parse('2021-12-01')+i.month; p d}

  # 6.times{|i| d = Date.parse('2021-12-01')+i.month; Saldo.calculate(month: d, force: true)}

  # ЮР.ЛИЦО
  # 55.times{|i| d = Date.parse('2017-06-01')+i.month; Saldo.calculate(month: d, force: true, account_type: 1)}
  # Saldo.calculate(month: Date.parse('2022-03-01'), force: true, account_type: 1)

  def self.calculate(month:, force: false, reserve_culc: false, account_type: nil)
    prev_month = (month - 1.month).end_of_month

    current_payments = LbPayment.
      buh_dates([month.beginning_of_month, month.end_of_month]).group_by_class.each_with_object({}) do |r, memo|
      memo[r.agrm_id] ||= {}
      memo[r.agrm_id][r['class_name']] = {
        amount:        BigDecimal(r.amount),
        service_type:  (r["service_types"].nil? ? nil : r["service_types"].split(",").select{|s| !s.nil? && s.size > 0}.uniq.first),
        # service_type:  (r["service_types"].nil? ? nil : r["service_types"].split(",").uniq.first),
      }
    end

    agreementsScope = LbAgreement.joins(:lb_account)
    if account_type != nil
      agreementsScope = agreementsScope.where(accounts: { type: account_type })
    end

    i = 0; t = agreementsScope.count

    agreementsScope.find_in_batches(batch_size: 1000) do |agreements|
      prev_saldos = Saldo.where(date: prev_month, agrm_id: agreements.map(&:agrm_id)).index_by(&:agrm_id)

      agreements.each do |a|
        Saldo.calculate_agreement(
          agreement: a,
          month: month,
          payment: current_payments[a.agrm_id],
          prev_saldo: prev_saldos[a.agrm_id],
          force: force,
          reserve_culc: reserve_culc,
        )
        puts "Progress: #{"*"*40} - #{i+=1}/#{t}"
      end
    end
  end

  # Saldo.calculate_agreement(agreement: LbAgreement.find_by(number: '7130340'), month: Date.parse('2020-04-01'))
  # Saldo.calculate_agreement(agreement: LbAgreement.find_by(agrm_id: 3123), month: Date.parse('2021-01-01'))

  def self.calculate_agreement(agreement:, month:, payment: nil, prev_saldo: nil, force: false, reserve_culc: false)
    prev_month = (month - 1.month).end_of_month
    fees = agreement.fee_by_group(month: month)

    if payment.nil?
      payment = LbPayment.
        buh_dates([month.beginning_of_month, month.end_of_month]).group_by_class.
        where(agrm_id: agreement.agrm_id).each_with_object({}) do |r, memo|
        memo[r.agrm_id] ||= {}

        memo[r.agrm_id][r['class_name']] = {
          amount:        BigDecimal(r.amount),
          service_type:  (r["service_types"].nil? ? nil : r["service_types"].split(",").select{|s| !s.nil? && s.size > 0}.uniq.first),
        }
      end[agreement.agrm_id] || {}
    end

    if prev_saldo.nil?
      prev_saldo = Saldo.where(date: prev_month, agrm_id: agreement.agrm_id).first || {
        saldo_internet: 0,
        saldo_internet_ones: 0,
        saldo_internet_period: 0,
        saldo_tv: 0,
        saldo_tv_ones: 0,
        saldo_tv_period: 0,
        saldo_video: 0,
        saldo_ud: 0,
        saldo_to_dom: 0,
        saldo_other: 0,
      }
    end

    params = {
      agrm_id: agreement.agrm_id,
      date: month.end_of_month,

      fee_internet:        BigDecimal(fees[:internet].sum{|i| i[:amount]}),
      fee_internet_ones:   BigDecimal(fees[:internet_ones].sum{|i| i[:amount]}),
      fee_internet_period: BigDecimal(fees[:internet_period].sum{|i| i[:amount]}),
      fee_tv:              BigDecimal(fees[:tv].sum{|i| i[:amount]}),
      fee_tv_ones:         BigDecimal(fees[:tv_ones].sum{|i| i[:amount]}),
      fee_tv_period:       BigDecimal(fees[:tv_period].sum{|i| i[:amount]}),
      fee_video:           BigDecimal(fees[:video].sum{|i| i[:amount]}),
      fee_ud:              BigDecimal(fees[:ud].sum{|i| i[:amount]}),
      fee_to_dom:          BigDecimal(fees[:to_dom].sum{|i| i[:amount]}),
      fee_other:           BigDecimal(fees[:other].sum{|i| i[:amount]}),

      payment_internet:        BigDecimal(0),
      payment_internet_ones:   BigDecimal(0),
      payment_internet_period: BigDecimal(0),
      payment_tv:              BigDecimal(0),
      payment_tv_ones:         BigDecimal(0),
      payment_tv_period:       BigDecimal(0),
      payment_video:           BigDecimal(0),
      payment_ud:              BigDecimal(0),
      payment_to_dom:          BigDecimal(0),
      payment_other:           BigDecimal(0),

      correction_internet:     BigDecimal(0),
      correction_internet_period:     BigDecimal(0),
      correction_tv:           BigDecimal(0),
      correction_tv_period:    BigDecimal(0),
      correction_video:        BigDecimal(0),
      correction_ud:           BigDecimal(0),
      correction_to_dom:       BigDecimal(0),
      correction_other:        BigDecimal(0),

      advance:                 BigDecimal(0),
    }

    params.merge!(
      saldo_internet:         prev_saldo[:saldo_internet],
      saldo_internet_ones:    prev_saldo[:saldo_internet_ones],
      saldo_internet_period:  prev_saldo[:saldo_internet_period],
      saldo_tv:               prev_saldo[:saldo_tv],
      saldo_tv_ones:          prev_saldo[:saldo_tv_ones],
      saldo_tv_period:        prev_saldo[:saldo_tv_period],
      saldo_video:            prev_saldo[:saldo_video],
      saldo_ud:               prev_saldo[:saldo_ud],
      saldo_to_dom:           prev_saldo[:saldo_to_dom],
      saldo_other:            prev_saldo[:saldo_other],
    )

    # Нужно для распеделения бонусов, если начисления и сальдо пустые, то смотрим на начальное сальдо
    init_params = Hash[params]

    # Вопрос к Владу: почему тут не сумируется сальдо other???
    sum_saldo = params[:saldo_internet].abs + params[:saldo_internet_period].abs +
                params[:saldo_tv].abs + params[:saldo_tv_period].abs +
                params[:saldo_video].abs + params[:saldo_ud].abs + params[:saldo_to_dom].abs
    init_sum_saldo = sum_saldo

    sum_fee = params[:fee_internet].abs + params[:fee_internet_period].abs +
              params[:fee_tv].abs + params[:fee_tv_period].abs +
              params[:fee_video].abs + params[:fee_ud].abs + params[:fee_to_dom].abs

    # --------------------- Обычные платежи ---------------------
    # Если указано, что платеж идет на конкретную услугу
    if payment['accounting'] && !payment['accounting'][:service_type].nil?
      case payment['accounting'][:service_type]
      when PAYMENT_SERVICE_TYPE_INTERNET then
        params[:saldo_internet] -= payment['accounting'][:amount]
        params[:payment_internet] = payment['accounting'][:amount]
      when PAYMENT_SERVICE_TYPE_TV then
        params[:saldo_tv] -= payment['accounting'][:amount]
        params[:payment_tv] = payment['accounting'][:amount]
      when PAYMENT_SERVICE_TYPE_VIDEO then
        params[:saldo_video] -= payment['accounting'][:amount]
        params[:payment_video] = payment['accounting'][:amount]
      when PAYMENT_SERVICE_TYPE_UD then
        params[:saldo_ud] -= payment['accounting'][:amount]
        params[:payment_ud] = payment['accounting'][:amount]
      when PAYMENT_SERVICE_TYPE_TO_DOM then
        params[:saldo_to_dom] -= payment['accounting'][:amount]
        params[:payment_to_dom] = payment['accounting'][:amount]
      end
    else
      payment_accounting       = BigDecimal(payment['accounting'] ? payment['accounting'][:amount] : 0)
      payment_accounting_sign = payment_accounting > 0 ? 1 : -1

      while payment_accounting.abs > 0
        if (s = params[:saldo_internet_ones]) && s != 0 && payment_accounting > 0
          cur_payment = (payment_accounting >= s) ? s : payment_accounting
          payment_accounting -= cur_payment
          params[:saldo_internet_ones] -= cur_payment
          params[:payment_internet_ones] = cur_payment
          next
        end
        if (s = params[:saldo_tv_ones]) && s != 0 && payment_accounting > 0
          cur_payment = (payment_accounting >= s) ? s : payment_accounting
          payment_accounting -= cur_payment
          params[:saldo_tv_ones] -= cur_payment
          params[:payment_tv_ones] = cur_payment
          next
        end

        if sum_saldo > 0
          rate = payment_accounting.abs/sum_saldo

          # Находим услуги с не нулевым сальдо по которым будем распределять оплату
          keys = [
            [:saldo_internet, :payment_internet],
            [:saldo_internet_period, :payment_internet_period],
            [:saldo_tv, :payment_tv],
            [:saldo_tv_period, :payment_tv_period],
            [:saldo_video, :payment_video],
            [:saldo_ud, :payment_ud],
            [:saldo_to_dom, :payment_to_dom],
          ].select{|(skey, _)| params[skey] != 0 }

          keys.each_with_index do |(skey, pkey), i|
            # Если это последний элемент, то берем оставшуюся сумму (нужно, чтобы сходились копейки)
            cur_payment = (i == keys.size - 1) ? payment_accounting.abs : (params[skey].abs*rate).round(2)
            payment_accounting = (payment_accounting.abs - cur_payment)*payment_accounting_sign
            params[skey] -= cur_payment*payment_accounting_sign
            params[pkey] = cur_payment*payment_accounting_sign
          end
        elsif sum_fee > 0
          rate = payment_accounting.abs/sum_fee

          # Находим услуги с не нулевым начислением по которым будем распределять оплату
          keys = [
            [:fee_internet,        :saldo_internet,        :payment_internet],
            [:fee_internet_period, :saldo_internet_period, :payment_internet_period],
            [:fee_tv,              :saldo_tv,              :payment_tv],
            [:fee_tv_period,       :saldo_tv_period,       :payment_tv_period],
            [:fee_video,           :saldo_video,           :payment_video],
            [:fee_ud,              :saldo_ud,              :payment_ud],
            [:fee_to_dom,          :saldo_to_dom,          :payment_to_dom],
          ].select{|(fkey, _)| params[fkey] != 0 }

          keys.each_with_index do |(fkey, skey, pkey), i|
            # Если это последний элемент, то берем оставшуюся сумму (нужно, чтобы сходились копейки)
            cur_payment = (i == keys.size - 1) ? payment_accounting.abs : (params[fkey].abs*rate).round(2)
            payment_accounting = (payment_accounting.abs - cur_payment)*payment_accounting_sign
            params[skey] -= cur_payment*payment_accounting_sign
            params[pkey] = cur_payment*payment_accounting_sign
          end
        end

        if payment_accounting.abs > 0
          cur_payment = 0.5 * payment_accounting.abs
          params[:saldo_internet] -= cur_payment*payment_accounting_sign
          params[:payment_internet] += cur_payment*payment_accounting_sign

          cur_payment = 0.5 * payment_accounting.abs
          params[:saldo_tv] -= cur_payment*payment_accounting_sign
          params[:payment_tv] += cur_payment*payment_accounting_sign
        end

        break
      end
    end

    # --------------------- Бонусные платежи ---------------------
    if payment['bonus'] && !payment['bonus'][:service_type].nil?
      case payment['bonus'][:service_type]
      when PAYMENT_SERVICE_TYPE_INTERNET then
        params[:saldo_internet] -= payment['bonus'][:amount]
        params[:payment_internet] = payment['bonus'][:amount]
      when PAYMENT_SERVICE_TYPE_TV then
        params[:saldo_tv] -= payment['bonus'][:amount]
        params[:payment_tv] = payment['bonus'][:amount]
      when PAYMENT_SERVICE_TYPE_VIDEO then
        params[:saldo_video] -= payment['bonus'][:amount]
        params[:payment_video] = payment['bonus'][:amount]
      when PAYMENT_SERVICE_TYPE_UD then
        params[:saldo_ud] -= payment['bonus'][:amount]
        params[:payment_ud] = payment['bonus'][:amount]
      when PAYMENT_SERVICE_TYPE_TO_DOM then
        params[:saldo_to_dom] -= payment['bonus'][:amount]
        params[:payment_to_dom] = payment['bonus'][:amount]
      end
    else
      payment_bonus            = BigDecimal(payment['bonus'] ? payment['bonus'][:amount] : 0)
      if payment_bonus.round(2) > 0
        sum_saldo = params[:saldo_internet].abs + params[:saldo_internet_period].abs +
                  params[:saldo_tv].abs + params[:saldo_tv_period].abs +
                  params[:saldo_video].abs + params[:saldo_to_dom].abs + params[:saldo_ud].abs

        if sum_saldo > 0
          rate = payment_bonus/sum_saldo

          keys = [
            [:saldo_internet,        :correction_internet],
            [:saldo_internet_period, :correction_internet_period],
            [:saldo_tv,              :correction_tv],
            [:saldo_tv_period,       :correction_tv_period],
            [:saldo_video,           :correction_video],
            [:saldo_ud,              :correction_ud],
            [:saldo_to_dom,          :correction_to_dom],
          ].select{|(skey, _)| params[skey] != 0 }

          keys.each_with_index do |(skey, ckey), i|
            # Если это последний элемент, то берем оставшуюся сумму (нужно, чтобы сходились копейки)
            cur_payment = (i == keys.size - 1) ? payment_bonus : (params[skey].abs*rate).round(2)
            payment_bonus -= cur_payment
            params[skey] -= cur_payment
            params[ckey] = cur_payment
          end
        elsif sum_fee > 0
          rate = payment_bonus/sum_fee

          keys = [
            [:fee_internet,        :saldo_internet,        :correction_internet],
            [:fee_internet_period, :saldo_internet_period, :correction_internet_period],
            [:fee_tv,              :saldo_tv,              :correction_tv],
            [:fee_tv_period,       :saldo_tv_period,       :correction_tv_period],
            [:fee_video,           :saldo_video,           :correction_video],
            [:fee_ud,              :saldo_ud,              :correction_ud],
            [:fee_to_dom,          :saldo_to_dom,          :correction_to_dom],
          ].select{|(fkey, _)| params[fkey] != 0 }

          keys.each_with_index do |(fkey, skey, ckey), i|
            cur_payment = (i == keys.size - 1) ? payment_bonus : (params[fkey].abs*rate).round(2)
            payment_bonus -= cur_payment
            params[skey] -= cur_payment
            params[ckey] = cur_payment
          end
        elsif init_sum_saldo > 0
          rate = payment_bonus/init_sum_saldo

          keys = [
            [:saldo_internet,        :correction_internet],
            [:saldo_internet_period, :correction_internet_period],
            [:saldo_tv,              :correction_tv],
            [:saldo_tv_period,       :correction_tv_period],
            [:saldo_video,           :correction_video],
            [:saldo_ud,              :correction_ud],
            [:saldo_to_dom,          :correction_to_dom],
          ].select{|(skey, _)| init_params[skey] != 0 }

          keys.each_with_index do |(skey, ckey), i|
            # Если это последний элемент, то берем оставшуюся сумму (нужно, чтобы сходились копейки)
            cur_payment = (i == keys.size - 1) ? payment_bonus : (init_params[skey].abs*rate).round(2)
            payment_bonus -= cur_payment
            params[skey] -= cur_payment
            params[ckey] = cur_payment
          end
        end

        # Если сальдо и начисления по нулям, то кладем все на интернет
        if payment_bonus > 0
          params[:saldo_internet] -= payment_bonus
          params[:correction_internet] += payment_bonus
        end
      end
    end

    payment_correction_tv       = BigDecimal(payment['correction_tv'] ? payment['correction_tv'][:amount] : 0)
    payment_correction_internet = BigDecimal(payment['correction_internet'] ? payment['correction_internet'][:amount] : 0)
    payment_correction_video    = BigDecimal(payment['correction_video'] ? payment['correction_video'][:amount] : 0)
    payment_correction_ud       = BigDecimal(payment['correction_ud'] ? payment['correction_ud'][:amount] : 0)
    payment_correction_to_dom   = BigDecimal(payment['correction_to_dom'] ? payment['correction_to_dom'][:amount] : 0)

    params[:saldo_tv] -= payment_correction_tv
    params[:correction_tv] += payment_correction_tv

    params[:saldo_internet] -= payment_correction_internet
    params[:correction_internet] += payment_correction_internet

    params[:saldo_video] -= payment_correction_video
    params[:correction_video] += payment_correction_video

    params[:saldo_ud] -= payment_correction_ud
    params[:correction_ud] += payment_correction_ud

    params[:saldo_to_dom] -= payment_correction_to_dom
    params[:correction_to_dom] += payment_correction_to_dom

    params[:saldo_internet] += params[:fee_internet]
    params[:saldo_internet_ones] += params[:fee_internet_ones]
    params[:saldo_internet_period] += params[:fee_internet_period]
    params[:saldo_tv] += params[:fee_tv]
    params[:saldo_tv_ones] += params[:fee_tv_ones]
    params[:saldo_tv_period] += params[:fee_tv_period]
    params[:saldo_video] += params[:fee_video]
    params[:saldo_other] += params[:fee_other]
    params[:saldo_ud] += params[:fee_ud]
    params[:saldo_to_dom] += params[:fee_to_dom]

    total_saldo = params[:saldo_internet] + params[:saldo_internet_ones] + params[:saldo_internet_period] + params[:saldo_tv] + params[:saldo_tv_ones] + params[:saldo_tv_period] + params[:saldo_video] + params[:saldo_other] + params[:saldo_ud] + params[:saldo_to_dom]
    total_payments = params[:payment_internet] + params[:payment_internet_ones] + params[:payment_internet_period] + params[:payment_tv] + params[:payment_tv_ones] + params[:payment_tv_period] + params[:payment_video] + params[:payment_ud] + params[:payment_to_dom] + params[:payment_other]
    total_fee = params[:fee_internet] + params[:fee_internet_ones] + params[:fee_internet_period] + params[:fee_tv] + params[:fee_tv_ones] + params[:fee_tv_period] + params[:fee_video] + params[:fee_ud] + params[:fee_to_dom] + params[:fee_other]

    total_correction = params[:correction_tv] + params[:correction_internet] + params[:correction_video] + params[:correction_ud] + params[:correction_to_dom]

    if total_correction > 0
      total_payments += total_correction
    elsif total_correction < 0
      total_fee += -1*total_correction
    end

    if total_saldo < 0
      params[:advance] = total_payments > -1*total_saldo ? -1*total_saldo : total_payments
    end

    if !!force
      s = Saldo.find_or_initialize_by(agrm_id: params[:agrm_id], date: params[:date])
      s.assign_attributes params
      s.save!
    else
      s = Saldo.create!(params)
    end

    # Для локального расчета резервов
    # s = Saldo.find_by(agrm_id: params[:agrm_id], date: params[:date])

    # Расчитывать резервы только в случае передачи флага reserve_culc
    if reserve_culc
      # Если есть переплата то создаем резерв или находим и обновляем с новыми данным(обновление нужно если сальдо вдруг пересчитывется)
      if params[:advance] > 0
        reserve = Reserve.find_or_initialize_by(agrm_id: params[:agrm_id], date: params[:date])
        reserve.assign_attributes({
          amount: params[:advance],
          balance: params[:advance],
        })
        reserve.save!
      # если при пересчете сальдо окажется что переплаты нету нужно проверить нет ли уже созданного резерва с последующим его удалением
      else
        reserve = Reserve.find_by(agrm_id: params[:agrm_id], date: params[:date])
        # В резерве надо прописать логику удаления операций по резерву
        reserve.destroy if reserve.present?
      end

      reserves = Reserve.where(agrm_id: params[:agrm_id])
        .where("balance > 0")
        .where.not(date: params[:date])
        .order(:date => :desc)
      # если было fee и есть резервы с положительным остатком нужно зафиксировать списание с резерва(-ов)
      if total_fee > 0 && reserves.present?
        advance_fee = total_fee
        # далее последовательно осушаем резервы
        reserves.each do |reserve|
          break if advance_fee == 0
          to_spend = reserve.balance >= advance_fee ? advance_fee : reserve.balance
          advance_fee = advance_fee - to_spend
          reserve.reserve_spends.create(saldo_id: s.saldo_id, fee_date: params[:date], amount: to_spend, operation_type: :spend)
        end
      end
    end
  end
end
