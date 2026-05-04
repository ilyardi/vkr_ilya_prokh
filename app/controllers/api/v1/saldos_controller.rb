module Api
  module V1
    class SaldosController < BaseController
      load_and_authorize_resource

      def index
        filter = params.fetch(:filter)
        date = (Date.parse(filter[:date]) rescue (Date.today - 1.month)).end_of_month
        prev_date = (date - 1.month).end_of_month

        if v = filter[:only].presence
          filter[:agrm_id] = Saldo
            .where('date = ?', date)
            .where("#{v} > 0").pluck(:agrm_id)
        end

        if filter[:type].present?
          filter[:type] = [filter[:type]].flatten
        else
          filter[:type] = [1,2]
        end

        @rows = LbAgreement.includes(:lb_account).where(accounts: { type: filter[:type] })
        [:number, :agrm_id].each do |field|
          if v = filter[field].presence
            @rows = @rows.public_send(:"search_by_#{field}", v)
          end
        end
        @rows = @rows.page(page_param).per(per_param)

        @saldos = Saldo
          .where('date = ? OR date = ?', date, prev_date)
          .where(agrm_id: @rows.map(&:agrm_id)).each_with_object({}) do |s, memo|
            memo[s.date] ||= {}
            memo[s.date][s.agrm_id] = s.attributes
            %w/saldo_internet saldo_internet_ones saldo_internet_period
            saldo_tv saldo_tv_ones saldo_tv_period saldo_video
            saldo_ud saldo_to_dom saldo_other
            advance
            fee_internet fee_internet_ones fee_internet_period
            fee_tv fee_tv_ones fee_tv_period fee_video
            fee_ud fee_to_dom fee_other
            payment_internet payment_internet_ones payment_internet_period
            payment_tv payment_tv_ones payment_tv_period payment_video
            payment_ud payment_to_dom payment_other
            correction_internet correction_internet_period correction_tv
            correction_ud correction_to_dom
            correction_tv_period correction_video correction_other/.each do |field|
              memo[s.date][s.agrm_id][field] = memo[s.date][s.agrm_id][field].to_f
            end
            %w/_internet _internet_ones _internet_period _tv _tv_ones
            _tv_period _video _ud _to_dom _other/.each do |field|
              if memo[s.date][s.agrm_id]['saldo'+field].to_f < 0
                memo[s.date][s.agrm_id]['over'+field] = memo[s.date][s.agrm_id]['saldo'+field].to_f
                memo[s.date][s.agrm_id]['dolg'+field] = 0
              elsif memo[s.date][s.agrm_id]['saldo'+field].to_f > 0
                memo[s.date][s.agrm_id]['over'+field] = 0
                memo[s.date][s.agrm_id]['dolg'+field] = memo[s.date][s.agrm_id]['saldo'+field].to_f
              else
                memo[s.date][s.agrm_id]['over'+field] = 0
                memo[s.date][s.agrm_id]['dolg'+field] = 0
              end
            end
        end

        @saldos[date] ||= {}
        @saldos[prev_date] ||= {}

        @total_saldo = Saldo
          .select('
            COUNT(*) as total,

            SUM(advance) as advance,

            SUM(saldo_internet) as saldo_internet,
            SUM(saldo_internet_ones) as saldo_internet_ones,
            SUM(saldo_internet_period) as saldo_internet_period,
            SUM(saldo_tv) as saldo_tv,
            SUM(saldo_tv_ones) as saldo_tv_ones,
            SUM(saldo_tv_period) as saldo_tv_period,
            SUM(saldo_video) as saldo_video,
            SUM(saldo_ud) as saldo_ud,
            SUM(saldo_to_dom) as saldo_to_dom,
            SUM(saldo_other) as saldo_other,

            SUM(CASE WHEN saldo_internet < 0 THEN saldo_internet ELSE 0 END) as over_internet,
            SUM(CASE WHEN saldo_internet_ones < 0 THEN saldo_internet_ones ELSE 0 END) as over_internet_ones,
            SUM(CASE WHEN saldo_internet_period < 0 THEN saldo_internet_period ELSE 0 END) as over_internet_period,
            SUM(CASE WHEN saldo_tv < 0 THEN saldo_tv ELSE 0 END) as over_tv,
            SUM(CASE WHEN saldo_tv_ones < 0 THEN saldo_tv_ones ELSE 0 END) as over_tv_ones,
            SUM(CASE WHEN saldo_tv_period < 0 THEN saldo_tv_period ELSE 0 END) as over_tv_period,
            SUM(CASE WHEN saldo_video < 0 THEN saldo_video ELSE 0 END) as over_video,
            SUM(CASE WHEN saldo_ud < 0 THEN saldo_ud ELSE 0 END) as over_ud,
            SUM(CASE WHEN saldo_to_dom < 0 THEN saldo_to_dom ELSE 0 END) as over_to_dom,
            SUM(CASE WHEN saldo_other < 0 THEN saldo_other ELSE 0 END) as over_other,
            SUM(CASE WHEN (saldo_internet +saldo_internet_ones +saldo_internet_period +saldo_tv +saldo_tv_ones +saldo_tv_period +saldo_video +saldo_ud +saldo_to_dom +saldo_other) < 0 THEN (saldo_internet +saldo_internet_ones +saldo_internet_period +saldo_tv +saldo_tv_ones +saldo_tv_period +saldo_video +saldo_ud +saldo_to_dom +saldo_other) ELSE 0 END) as over,

            SUM(CASE WHEN saldo_internet > 0 THEN saldo_internet ELSE 0 END) as dolg_internet,
            SUM(CASE WHEN saldo_internet_ones > 0 THEN saldo_internet_ones ELSE 0 END) as dolg_internet_ones,
            SUM(CASE WHEN saldo_internet_period > 0 THEN saldo_internet_period ELSE 0 END) as dolg_internet_period,
            SUM(CASE WHEN saldo_tv > 0 THEN saldo_tv ELSE 0 END) as dolg_tv,
            SUM(CASE WHEN saldo_tv_ones > 0 THEN saldo_tv_ones ELSE 0 END) as dolg_tv_ones,
            SUM(CASE WHEN saldo_tv_period > 0 THEN saldo_tv_period ELSE 0 END) as dolg_tv_period,
            SUM(CASE WHEN saldo_video > 0 THEN saldo_video ELSE 0 END) as dolg_video,
            SUM(CASE WHEN saldo_ud > 0 THEN saldo_ud ELSE 0 END) as dolg_ud,
            SUM(CASE WHEN saldo_to_dom > 0 THEN saldo_to_dom ELSE 0 END) as dolg_to_dom,
            SUM(CASE WHEN saldo_other > 0 THEN saldo_other ELSE 0 END) as dolg_other,
            SUM(CASE WHEN (saldo_internet +saldo_internet_ones +saldo_internet_period +saldo_tv +saldo_tv_ones +saldo_tv_period +saldo_video +saldo_ud +saldo_to_dom +saldo_other) > 0 THEN (saldo_internet +saldo_internet_ones +saldo_internet_period +saldo_tv +saldo_tv_ones +saldo_tv_period +saldo_video +saldo_ud +saldo_to_dom +saldo_other) ELSE 0 END) as dolg,

            SUM(fee_internet) as fee_internet,
            SUM(fee_internet_ones) as fee_internet_ones,
            SUM(fee_internet_period) as fee_internet_period,
            SUM(fee_tv) as fee_tv,
            SUM(fee_tv_ones) as fee_tv_ones,
            SUM(fee_tv_period) as fee_tv_period,
            SUM(fee_video) as fee_video,
            SUM(fee_ud) as fee_ud,
            SUM(fee_to_dom) as fee_to_dom,
            SUM(fee_other) as fee_other,

            SUM(payment_internet) as payment_internet,
            SUM(payment_internet_ones) as payment_internet_ones,
            SUM(payment_internet_period) as payment_internet_period,
            SUM(payment_tv) as payment_tv,
            SUM(payment_tv_ones) as payment_tv_ones,
            SUM(payment_tv_period) as payment_tv_period,
            SUM(payment_video) as payment_video,
            SUM(payment_ud) as payment_ud,
            SUM(payment_to_dom) as payment_to_dom,
            SUM(payment_other) as payment_other,

            SUM(correction_internet) as correction_internet,
            SUM(correction_internet_period) as correction_internet_period,
            SUM(correction_tv) as correction_tv,
            SUM(correction_tv_period) as correction_tv_period,
            SUM(correction_video) as correction_video,
            SUM(correction_ud) as correction_ud,
            SUM(correction_to_dom) as correction_to_dom,
            SUM(correction_other) as correction_other,
            teleset_saldos.date')
          .joins('JOIN agreements USING(agrm_id) JOIN accounts USING(uid)')
          .where('teleset_saldos.date = ? OR teleset_saldos.date = ?', date, prev_date)
          .where('accounts.type IN (?)', filter[:type])
          .group('teleset_saldos.date')
          .each_with_object({}) do |s, memo|
            memo[s.date] = s.attributes
            %w/saldo_internet saldo_internet_ones saldo_internet_period
            saldo_tv saldo_tv_ones saldo_tv_period saldo_video
            saldo_ud saldo_to_dom saldo_other
            advance
            over over_internet over_internet_ones over_internet_period
            over_tv over_tv_ones over_tv_period over_video over_ud over_to_dom over_other
            dolg dolg_internet dolg_internet_ones dolg_internet_period
            dolg_tv dolg_tv_ones dolg_tv_period dolg_video dolg_ud dolg_to_dom dolg_other
            fee_internet fee_internet_ones fee_internet_period
            fee_tv fee_tv_ones fee_tv_period fee_video
            fee_ud fee_to_dom fee_other
            payment_internet payment_internet_ones payment_internet_period
            payment_tv payment_tv_ones payment_tv_period payment_video
            payment_ud payment_to_dom payment_other
            correction_internet correction_internet_period correction_tv
            correction_ud correction_to_dom
            correction_tv_period correction_video correction_other/.each do |field|
              memo[s.date][field] = memo[s.date][field].to_f
            end
        end

        @total_saldo[date] ||= {}
        @total_saldo[prev_date] ||= {}

        render
      end

      def reserves_report
        filter = params.fetch(:filter)
        date = (Date.parse(filter[:date]) rescue (Date.today - 1.month)).end_of_month

        agreements = LbAgreement.includes(:lb_account).where(accounts: { type: 1 })
        agrm_ids = agreements.pluck(:agrm_id)

        reserves = Reserve.where(date: (date.beginning_of_year - 1.month)..date.end_of_year)
        if filter[:type] == '1'
          reserves = reserves.where(agrm_id: agrm_ids)
        elsif filter[:type] == '2'
          reserves = reserves.where.not(agrm_id: agrm_ids)
        end

        start_date = (date.beginning_of_year - 1.month).end_of_month
        @result = []
        month = 0
        while month <= 12 do
          cash_reserves = reserves.where(date: start_date.end_of_month + month.month)
          row = {
            reserve_summ: cash_reserves.sum(:amount),
            reserve_balance: cash_reserves.sum(:balance),
            month: (start_date.end_of_month + month.month).strftime("%B"),
            spends: []
          }
          reserve_ids = cash_reserves.pluck(:id)
          reserve_spends = ReserveSpend.select("fee_date, SUM(amount) as summ").group(:fee_date).where(reserve_id: reserve_ids).order(:fee_date => :asc)
          reserve_balance = row[:reserve_summ]
          row[:spends] = {}
          reserve_spends.each do |record|
            reserve_balance -= record[:summ]
            row[:spends][record[:fee_date].strftime("%m")] = {
              summ: record[:summ],
              balance: reserve_balance
            }
          end
          @result << row
          month += 1
        end
      end

      def ur_csv_report
        date = (Date.parse(params[:date]) rescue (Date.today - 1.month)).end_of_month

        sql = <<-SQL
          select ag.number, (ts.saldo_internet+ts.saldo_internet_ones+ts.saldo_internet_period+ts.saldo_tv+ts.saldo_tv_ones+ts.saldo_tv_period+ts.saldo_video+ts.saldo_other+ts.saldo_ud+ts.saldo_to_dom)
          from teleset_saldos ts
          join agreements ag on ag.agrm_id = ts.agrm_id
          join accounts ac on ag.uid = ac.uid
          where ts.date = "#{date}" AND ac.type = 1
        SQL

        @result = LbAgreement.connection.execute(sql).to_a
      end

      def agrms_csv_report
        date = (Date.parse(params[:date]) rescue (Date.today - 1.month)).beginning_of_month
        sql = <<-SQL
          select fl_prev.prev_saldo,
              fl_prev.prev_saldo_int_comp,
              fl_prev.prev_saldo_tv_comp,
              fl_prev.prev_saldo_video,
              fl_prev.prev_saldo_ud,
              fl_prev.prev_saldo_to_dom,
              fl_prev.prev_saldo_other,
              fl_prev.prev_saldo_internet,
              fl_prev.prev_saldo_internet_ones,
              fl_prev.prev_saldo_internet_period,
              fl_prev.prev_saldo_tv,
              fl_prev.prev_saldo_tv_ones,
              fl_prev.prev_saldo_tv_period,
              fl_prev.prev_over_internet,
              fl_prev.prev_over_internet_ones,
              fl_prev.prev_over_internet_period,
              fl_prev.prev_over_tv,
              fl_prev.prev_over_tv_ones,
              fl_prev.prev_over_tv_period,
              fl_prev.prev_over_video,
              fl_prev.prev_over_ud,
              fl_prev.prev_over_to_dom,
              fl_prev.prev_over_other,
              fl_prev.prev_dolg_internet,
              fl_prev.prev_dolg_internet_ones,
              fl_prev.prev_dolg_internet_period,
              fl_prev.prev_dolg_tv,
              fl_prev.prev_dolg_tv_ones,
              fl_prev.prev_dolg_tv_period,
              fl_prev.prev_dolg_video,
              fl_prev.prev_dolg_ud,
              fl_prev.prev_dolg_to_dom,
              fl_prev.prev_dolg_other,
              fl_prev.prev_advance,
              (CASE WHEN (fl_prev.prev_saldo) < 0 THEN fl_prev.prev_saldo ELSE 0 END) as 'prev_over',
              (CASE WHEN (fl_prev.prev_saldo) > 0 THEN fl_prev.prev_saldo ELSE 0 END) as 'prev_dolg',
              (CASE WHEN (fl.curr_saldo) < 0 THEN fl.curr_saldo ELSE 0 END) as 'over',
              (CASE WHEN (fl.curr_saldo) > 0 THEN fl.curr_saldo ELSE 0 END) as 'dolg',
              fl.*
          from (
              select sl.*, ps.pay, ts.fee
              from (
                  select ag.number as 'number', ag.agrm_id as 'agrm_id',
                      (ts.saldo_internet + ts.saldo_internet_ones + ts.saldo_internet_period + ts.saldo_tv + ts.saldo_tv_ones + ts.saldo_tv_period + ts.saldo_ud + ts.saldo_to_dom + ts.saldo_video + ts.saldo_other) as 'curr_saldo',
                      (CASE WHEN ts.saldo_internet < 0 THEN ts.saldo_internet ELSE 0 END) as 'over_internet',
                      (CASE WHEN ts.saldo_internet_ones < 0 THEN ts.saldo_internet_ones ELSE 0 END) as 'over_internet_ones',
                      (CASE WHEN ts.saldo_internet_period < 0 THEN ts.saldo_internet_period ELSE 0 END) as 'over_internet_period',
                      (CASE WHEN ts.saldo_tv < 0 THEN ts.saldo_tv ELSE 0 END) as 'over_tv',
                      (CASE WHEN ts.saldo_tv_ones < 0 THEN ts.saldo_tv_ones ELSE 0 END) as 'over_tv_ones',
                      (CASE WHEN ts.saldo_tv_period < 0 THEN ts.saldo_tv_period ELSE 0 END) as 'over_tv_period',
                      (CASE WHEN ts.saldo_video < 0 THEN ts.saldo_video ELSE 0 END) as 'over_video',
                      (CASE WHEN ts.saldo_ud < 0 THEN ts.saldo_ud ELSE 0 END) as 'over_ud',
                      (CASE WHEN ts.saldo_to_dom < 0 THEN ts.saldo_to_dom ELSE 0 END) as 'over_to_dom',
                      (CASE WHEN ts.saldo_other < 0 THEN ts.saldo_other ELSE 0 END) as 'over_other',
                      (CASE WHEN ts.saldo_internet > 0 THEN ts.saldo_internet ELSE 0 END) as 'dolg_internet',
                      (CASE WHEN ts.saldo_internet_ones > 0 THEN ts.saldo_internet_ones ELSE 0 END) as 'dolg_internet_ones',
                      (CASE WHEN ts.saldo_internet_period > 0 THEN ts.saldo_internet_period ELSE 0 END) as 'dolg_internet_period',
                      (CASE WHEN ts.saldo_tv > 0 THEN ts.saldo_tv ELSE 0 END) as 'dolg_tv',
                      (CASE WHEN ts.saldo_tv_ones > 0 THEN ts.saldo_tv_ones ELSE 0 END) as 'dolg_tv_ones',
                      (CASE WHEN ts.saldo_tv_period > 0 THEN ts.saldo_tv_period ELSE 0 END) as 'dolg_tv_period',
                      (CASE WHEN ts.saldo_video > 0 THEN ts.saldo_video ELSE 0 END) as 'dolg_video',
                      (CASE WHEN ts.saldo_ud > 0 THEN ts.saldo_ud ELSE 0 END) as 'dolg_ud',
                      (CASE WHEN ts.saldo_to_dom > 0 THEN ts.saldo_to_dom ELSE 0 END) as 'dolg_to_dom',
                      (CASE WHEN ts.saldo_other > 0 THEN ts.saldo_other ELSE 0 END) as 'dolg_other',
                      (ts.saldo_internet + ts.saldo_internet_ones + ts.saldo_internet_period) as 'saldo_int_comp',
                      (ts.saldo_tv + ts.saldo_tv_ones + ts.saldo_tv_period) as 'saldo_tv_comp',
                      ts.saldo_internet, ts.saldo_internet_ones, ts.saldo_internet_period, ts.saldo_tv, ts.saldo_tv_ones, ts.saldo_tv_period, ts.saldo_video, ts.saldo_ud, ts.saldo_to_dom, ts.saldo_other,
                      (ts.fee_internet + ts.fee_internet_ones + ts.fee_internet_period) as 'fee_int_comp',
                      (ts.fee_tv + ts.fee_tv_ones + ts.fee_tv_period) as 'fee_tv_comp',
                      ts.fee_internet, ts.fee_internet_ones, ts.fee_internet_period, ts.fee_tv, ts.fee_tv_ones, ts.fee_tv_period, ts.fee_video, ts.fee_ud, ts.fee_to_dom, ts.fee_other,
                      (ts.payment_internet + ts.payment_internet_ones + ts.payment_internet_period) as 'payment_int_comp',
                      (ts.payment_tv + ts.payment_tv_ones + ts.payment_tv_period) as 'payment_tv_comp',
                      ts.payment_internet, ts.payment_internet_ones, ts.payment_internet_period, ts.payment_tv, ts.payment_tv_ones, ts.payment_tv_period, ts.payment_video, ts.payment_ud, ts.payment_to_dom, ts.payment_other,
                      (ts.correction_internet + ts.correction_internet_period) as 'correction_int_comp',
                      (ts.correction_tv + ts.correction_tv_period) as 'correction_tv_comp',
                      ts.correction_internet, ts.correction_internet_period, ts.correction_tv, ts.correction_tv_period, ts.correction_video, ts.correction_ud,  ts.correction_to_dom, ts.correction_other,
                      ts.advance
                  from teleset_saldos ts
                  join agreements ag on ag.agrm_id = ts.agrm_id
                  join accounts ac on ag.uid = ac.uid
                  where (ts.date IN (last_day("#{date}"))) AND ac.type = 2 AND number IS NOT NULL
                  ) sl
              left JOIN (
                  select ps.agrm_id as 'agrm_id', sum(ps.amount) as 'pay'
                  from payments ps
                  JOIN pay_classes pc on pc.class_id = ps.class_id
                  JOIN agreements ag on ps.agrm_id = ag.agrm_id
                  where (buh_date between DATE_FORMAT("#{date}", '%Y-%m-%d %H:%i:%S') AND DATE_FORMAT(last_day("#{date}"), '%Y-%m-%d 23:59:59.999999')) AND (pc.name LIKE '%$%' OR pc.name LIKE '%Юкасса%')
                  group by ps.agrm_id
              ) ps on ps.agrm_id = sl.agrm_id
              left JOIN teleset_charges ts on ts.agrm_id = sl.agrm_id AND ts.month = "#{date}"
            ) as fl
          left join (
              select sl.*, ps.pay, ts.fee
              from (
                  select ag.number as 'number', ag.agrm_id as 'agrm_id',
                      (ts.saldo_internet + ts.saldo_internet_ones + ts.saldo_internet_period + ts.saldo_tv + ts.saldo_tv_ones + ts.saldo_tv_period + ts.saldo_video + ts.saldo_other) as 'prev_saldo',
                      (ts.saldo_internet + ts.saldo_internet_ones + ts.saldo_internet_period) as 'prev_saldo_int_comp',
                      (ts.saldo_tv + ts.saldo_tv_ones + ts.saldo_tv_period) as 'prev_saldo_tv_comp',
                      ts.saldo_video as 'prev_saldo_video',
                      ts.saldo_ud as 'prev_saldo_ud',
                      ts.saldo_to_dom as 'prev_saldo_to_dom',
                      ts.saldo_other as 'prev_saldo_other',
                      ts.saldo_internet as 'prev_saldo_internet',
                      ts.saldo_internet_ones as 'prev_saldo_internet_ones',
                      ts.saldo_internet_period as 'prev_saldo_internet_period',
                      ts.saldo_tv as 'prev_saldo_tv',
                      ts.saldo_tv_ones as 'prev_saldo_tv_ones',
                      ts.saldo_tv_period as 'prev_saldo_tv_period',
                      (CASE WHEN ts.saldo_internet < 0 THEN ts.saldo_internet ELSE 0 END) as 'prev_over_internet',
                      (CASE WHEN ts.saldo_internet_ones < 0 THEN ts.saldo_internet_ones ELSE 0 END) as 'prev_over_internet_ones',
                      (CASE WHEN ts.saldo_internet_period < 0 THEN ts.saldo_internet_period ELSE 0 END) as 'prev_over_internet_period',
                      (CASE WHEN ts.saldo_tv < 0 THEN ts.saldo_tv ELSE 0 END) as 'prev_over_tv',
                      (CASE WHEN ts.saldo_tv_ones < 0 THEN ts.saldo_tv_ones ELSE 0 END) as 'prev_over_tv_ones',
                      (CASE WHEN ts.saldo_tv_period < 0 THEN ts.saldo_tv_period ELSE 0 END) as 'prev_over_tv_period',
                      (CASE WHEN ts.saldo_video < 0 THEN ts.saldo_video ELSE 0 END) as 'prev_over_video',
                      (CASE WHEN ts.saldo_ud < 0 THEN ts.saldo_ud ELSE 0 END) as 'prev_over_ud',
                      (CASE WHEN ts.saldo_to_dom < 0 THEN ts.saldo_to_dom ELSE 0 END) as 'prev_over_to_dom',
                      (CASE WHEN ts.saldo_other < 0 THEN ts.saldo_other ELSE 0 END) as 'prev_over_other',
                      (CASE WHEN ts.saldo_internet > 0 THEN ts.saldo_internet ELSE 0 END) as 'prev_dolg_internet',
                      (CASE WHEN ts.saldo_internet_ones > 0 THEN ts.saldo_internet_ones ELSE 0 END) as 'prev_dolg_internet_ones',
                      (CASE WHEN ts.saldo_internet_period > 0 THEN ts.saldo_internet_period ELSE 0 END) as 'prev_dolg_internet_period',
                      (CASE WHEN ts.saldo_tv > 0 THEN ts.saldo_tv ELSE 0 END) as 'prev_dolg_tv',
                      (CASE WHEN ts.saldo_tv_ones > 0 THEN ts.saldo_tv_ones ELSE 0 END) as 'prev_dolg_tv_ones',
                      (CASE WHEN ts.saldo_tv_period > 0 THEN ts.saldo_tv_period ELSE 0 END) as 'prev_dolg_tv_period',
                      (CASE WHEN ts.saldo_video > 0 THEN ts.saldo_video ELSE 0 END) as 'prev_dolg_video',
                      (CASE WHEN ts.saldo_ud > 0 THEN ts.saldo_ud ELSE 0 END) as 'prev_dolg_ud',
                      (CASE WHEN ts.saldo_to_dom > 0 THEN ts.saldo_to_dom ELSE 0 END) as 'prev_dolg_to_dom',
                      (CASE WHEN ts.saldo_other > 0 THEN ts.saldo_other ELSE 0 END) as 'prev_dolg_other',
                      ts.advance as 'prev_advance'
                  from teleset_saldos ts
                  join agreements ag on ag.agrm_id = ts.agrm_id
                  join accounts ac on ag.uid = ac.uid
                  where (ts.date IN (last_day(DATE_SUB("#{date}", INTERVAL 1 MONTH)))) AND ac.type = 2 AND number IS NOT NULL
                ) sl
              left JOIN (
                  select ps.agrm_id as 'agrm_id', sum(ps.amount) as 'pay'
                  from payments ps
                  JOIN pay_classes pc on pc.class_id = ps.class_id
                  JOIN agreements ag on ps.agrm_id = ag.agrm_id
                  where (buh_date between DATE_FORMAT(DATE_SUB("#{date}", INTERVAL 1 MONTH), '%Y-%m-%d %H:%i:%S') AND DATE_FORMAT(last_day(DATE_SUB("#{date}", INTERVAL 1 MONTH)), '%Y-%m-%d 23:59:59.999999'))
                    AND (pc.name LIKE '%$%' OR pc.name LIKE '%Юкасса%')
                  group by ps.agrm_id
              ) ps on ps.agrm_id = sl.agrm_id
              left JOIN teleset_charges ts on ts.agrm_id = sl.agrm_id AND ts.month = DATE_SUB("#{date}", INTERVAL 1 MONTH)
          ) as fl_prev on fl.agrm_id = fl_prev.agrm_id
        SQL

        @result = LbAgreement.connection.execute(sql).to_a
      end

      # def calculate
      #   month = Date.parse(params[:month]).end_of_month
      #   # Saldo.where(date: '2020-06-30').delete_all
      #   # Saldo.calculate(month: (Date.today - 6.days).beginning_of_month)

      # end

    end
  end
end


# Saldo.connection.execute('TRUNCATE TABLE teleset_saldos')

# i=0; t=IrcAccountSaldo.count
# tv = Service.tv
# inet = Service.internet
# IrcAccountSaldo.all.each do |a|
#   h = {}
#   a.details['services'].each do |q|
#     service = q['name'].include?('Антенна') ? tv : inet
#     h[service] ||= {saldo: 0, fee: 0}
#     h[service][:saldo] += q['saldo']
#     h[service][:fee] += q['fee']
#   end

#   h.each do |sid, q|
#     Saldo.create({
#       agrm_id: a.agrm_id,
#       service: sid,
#       date: (a.date - 1.day).end_of_month,
#       amount: q[:saldo],
#       fee_amount: q[:fee],
#     })
#   end
#   print "\r#{i+=1}/#{t}"
# end; nil
