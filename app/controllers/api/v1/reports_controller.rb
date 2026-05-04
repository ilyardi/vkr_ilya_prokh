module Api
  module V1
    class ReportsController < BaseController
      def connection_source
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 10).to_i

        year = params[:filter][:year] || Date.today.year
        month = params[:filter][:month] || Date.today.month

        sql = "select ac.bill_delivery, va.str_value, address_format(2, vg.uid, '%s. %S, %B, %f. %F') as address, ag.number, tf.descr as tarif, IF(vg.id=1, 'ИНТ', 'ТВ') as usluga, vg.acc_ondate, ag.agrm_id
               from vgroups vg
               LEFT JOIN vgroups_addons_vals va ON vg.vg_id = va.vg_id AND va.name = 'connect_reason'
               LEFT JOIN agreements ag ON vg.agrm_id = ag.agrm_id
               LEFT JOIN accounts ac ON vg.uid = ac.uid
               LEFT JOIN tarifs tf ON vg.tar_id = tf.tar_id
               WHERE DATE_FORMAT(acc_ondate, '%Y%m') = '#{year}#{'%02d' % month}'
               ORDER BY vg.acc_ondate ASC"

        @vgroups = LbBase.connection.exec_query(sql).to_a
      end

      def fee_pay(source_file)
        from = Date.parse('2022-01-01')
        to = Date.today
        # agrm_ids = [28399, 21901, 1274]
        # f = params[:file]
        f = File.open(source_file)
        # f = File.open('public/uploads/tmp/agrm_group_1.csv')
        # f = File.open('public/uploads/tmp/agrm_group_2.csv')
        # f = File.open('public/uploads/tmp/agrm_group_3.csv')
        # f = File.open('public/uploads/tmp/agrm_group_4.csv')
        paths = []
        begin
        paths << fee_pay('public/uploads/tmp/agrm_group_1.csv')
        paths << fee_pay('public/uploads/tmp/agrm_group_2.csv')
        paths << fee_pay('public/uploads/tmp/agrm_group_3.csv')
        paths << fee_pay('public/uploads/tmp/agrm_group_4.csv')
        paths << fee_pay('public/uploads/tmp/agrm_group_5.csv')
        end
        #

        rows = f.read.split(/\r?\n/).map do |r|
          r.try(:force_encoding,'utf-8').split(/[,\t;]/)
        end
        rows.shift
        agrm_numbers = rows.map(&:first)

        agreements = LbAgreement.includes(:lb_account).where(number: agrm_numbers); nil
        agrm_ids = agreements.map(&:agrm_id)

        @report_headers = [:agrm_id, :number, :address, :phone, :fax, :bill_delivery, :lk_status]
        @report = []
        @dates = []
        payments = {}
        fees = {}

        curr = from.beginning_of_month
        while curr <= to.beginning_of_month do
          payments[curr] = LbPayment.
            pay_date([curr.beginning_of_month, curr.end_of_month]).
            where(agrm_id: agrm_ids).each_with_object({}) do |r, memo|
            memo[r.agrm_id] = r.amount
          end
          fees[curr] = LbAgreement.fee(curr, agrm_ids)

          @report_headers << :"fee_#{curr.strftime('%Y-%m')}"
          @report_headers << :"payment_#{curr.strftime('%Y-%m')}"
          @dates << curr
          curr += 1.month
        end

        agreements.each do |ag|
          row = [
            ag.agrm_id,
            ag.number,
            ag.lb_account.address_connect,
            ag.lb_account.phone,
            ag.lb_account.fax,
            ag.lb_account.bill_delivery,
            ag.lk_status
          ]
          @dates.each do |d|
            row << (fees[d][ag.agrm_id] || 0)
            row << (payments[d][ag.agrm_id] || 0)
          end

          @report << row
        end;nil

        filename = Rails.root.join('public/uploads/reports', "#{Time.now.to_i}_fee_pay_#{from.beginning_of_month.strftime('%Y-%m')}_#{to.beginning_of_month.strftime('%Y-%m')}.csv")

        CSV.open(filename, "wb") do |csv|
          csv << @report_headers
          @report.each do |row|
            csv << row
          end
        end

        return filename
      end

      def statistic_service_requests
        year = params[:year]
        requests = Request.left_outer_joins(:request_type,:request_status, :executor_user, :request_reason, :request_subtype).where("
          request_types.name = 'Сервис' OR
          (request_types.name = 'Подключение' AND users.role = 9) OR
          request_types.name = 'Служебная' OR
          request_types.name = 'Другое'")
        quantity_request_by_reason = RequestReason.all.order(service_location: :desc,service_type: :desc, updated_at: :asc).map {|reason| {reason: reason, total_count: 0}}
        @summary_solved_remotely_requests_by_group = [
          {group: "tv",total_count: 0},
          {group: "internet",total_count: 0},
          {group: "int_tv",total_count: 0},
        ]
        @summary_requests_by_group = [
          {group: "tv",total_count: 0},
          {group: "internet",total_count: 0},
          {group: "int_tv",total_count: 0},
          {group: "other", total_count: 0},
        ]

        @summary_service_requests = {record_name:"ИТОГО сервисных задач #{year}",total_count: 0}
        @summary_solved_remotely_requests= {record_name:"Решено удаленно ИТОГО #{year}",total_count: 0}

        @summary_outside_requests_by_time = {record_name:"Сервисные задачи", total_count: 0}
        @summary_inside_requests_by_time = {record_name:"Внутренние работы", total_count: 0}
        @summary_official_requests_by_time = {record_name:"Служебные", total_count: 0}
        @summary_blank_slots_by_time = {record_name:"Пустые слоты", total_count: 0}

        for i in 1..12 do
          start_date = Time.new(year,i).beginning_of_month()
          end_date = Time.new(year,i).end_of_month()
          @summary_service_requests[i] = 0
          @summary_solved_remotely_requests[i] = 0
          requests_by_month = requests.where(plan_started_at: start_date..end_date, plan_finished_at: start_date..end_date)

          inside_requests_by_time_in_month = (requests_by_month.where("request_subtypes.name = 'Внутренняя' AND users.role = 9")
                                          .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                          .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          outside_requests_by_time_in_month = (requests_by_month.where("request_subtypes.name = 'Абонентский сервис' AND users.role = 9")
                                    .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                    .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          accident_requests_by_time_in_month = (requests_by_month.where("request_subtypes.name = 'Авария' AND users.role = 9")
                                    .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                    .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          other_requests_by_time_in_month = (requests_by_month.where("request_types.name = 'Другое' AND users.role = 9")
                                          .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                          .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          official_requests_by_time_in_month = (requests_by_month.where("request_types.name = 'Служебная' AND users.role = 9")
                                                .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                                .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          plan_slots_by_time_in_month = WorkingDay.joins(:user).where(date: start_date..end_date).where("users.role = 9").size*12

          fact_slots_by_time_in_month = (requests_by_month.where("users.role = 9")
                                          .select("SUM(age(plan_finished_at,plan_started_at)) as total_time")
                                          .order(total_time: :asc).first.total_time.to_f/3600 if requests_by_month.size > 0) || 0

          blank_slots_by_time_in_month = plan_slots_by_time_in_month - fact_slots_by_time_in_month

          ssrr_by_month = requests_by_month.where("users.role = 5")
                          .select("request_reasons.service_type as type, COUNT(requests.id) as count")
                          .group("request_reasons.service_type").index_by(&:type)

          total_by_month = requests_by_month.select("request_reasons.service_type as type, COUNT(requests.id) as count")
                          .group("request_reasons.service_type").index_by(&:type)

          rbr_by_month = requests_by_month.select("request_reason_id, COUNT(requests.id) as count")
                          .group(:request_reason_id).index_by(&:request_reason_id)

          quantity_request_by_reason.each{|record|
            count = rbr_by_month[record[:reason].id].present? ? rbr_by_month[record[:reason].id].count : 0
            record[i] = count
            record[:total_count] += count
          }
          @summary_solved_remotely_requests_by_group.each{|record|
            count = ssrr_by_month[record[:group]].present? ? ssrr_by_month[record[:group]].count : 0
            record[i] = count
            record[:total_count] += count
            @summary_solved_remotely_requests[i] +=count
            @summary_solved_remotely_requests[:total_count] +=count
          }
          @summary_requests_by_group.each{|record|
            count = total_by_month[record[:group]].present? ? total_by_month[record[:group]].count : 0
            record[i] = count
            record[:total_count] += count
            next if record[:group] == 'other'
            @summary_service_requests[i] +=count
            @summary_service_requests[:total_count] +=count
          }
          @summary_inside_requests_by_time[i] = inside_requests_by_time_in_month.round(2)
          @summary_inside_requests_by_time[:total_count] += inside_requests_by_time_in_month.round(2)
          @summary_outside_requests_by_time[i] = outside_requests_by_time_in_month.round(2)
          @summary_outside_requests_by_time[:total_count] += outside_requests_by_time_in_month.round(2)
          @summary_official_requests_by_time[i] = official_requests_by_time_in_month.round(2)
          @summary_official_requests_by_time[:total_count] += official_requests_by_time_in_month.round(2)
          @summary_blank_slots_by_time[i] = blank_slots_by_time_in_month.round(2)
          @summary_blank_slots_by_time[:total_count] += blank_slots_by_time_in_month.round(2)
        end

        @summary_data = [
          @summary_service_requests,
          @summary_solved_remotely_requests,
        ]

        @summary_data_by_time = [
          @summary_outside_requests_by_time,
          @summary_inside_requests_by_time,
          @summary_official_requests_by_time,
          @summary_blank_slots_by_time
        ]

        @tv_records = quantity_request_by_reason.find_all{|item| item[:reason].service_type == 'tv'}
        @int_records = quantity_request_by_reason.find_all{|item| item[:reason].service_type == 'internet'}
        @int_tv_records = quantity_request_by_reason.find_all{|item| item[:reason].service_type == 'int_tv'}
        @other_records = quantity_request_by_reason.find_all{|item| item[:reason].service_type == 'other'}
      end

      def manager_sales
        date = params[:date].to_time || Time.new()
        requests = Request.joins(:request_type,:responsible_user,:request_subtype,:request_status)
                          .where("request_types.name = 'Подключение' AND users.role IN (2, 12) AND request_statuses.name = 'Подключена' AND requests.parent_id IS NULL")
                          .where(plan_started_at: date.beginning_of_month..date.end_of_month, plan_finished_at: date.beginning_of_month..date.end_of_month)
        # users = User.call_department.select(:id,:name)
        users = requests.select('responsible_user_id as id, users.name as name').distinct
        @tarifs = requests.select('request_subtypes.name as name, request_subtype_id as id').distinct
        agregate_data = requests.select('responsible_user_id, request_subtype_id, COUNT(requests.id) as count')
                                .group(:responsible_user_id,:request_subtype_id).order(responsible_user_id: :desc)
                                .index_by{|record|"#{record.responsible_user_id}_#{record.request_subtype_id}"}
        @manager_sales = []

        users.each{|user|
          record = {user: user}
          @tarifs.each{|tarif|
            index = "#{user.id}_#{tarif.id}"
            count = agregate_data[index] ? agregate_data[index].count : 0
            record[tarif.name] = count
          }
          @manager_sales << record
        }
      end

      def conversion_time_slots
        date = params[:date].to_time || Time.new()
        connect_engineers = WorkingDay.joins(:user).where("users.role = 8")
                                      .where(date: date.beginning_of_month..date.end_of_month)
                                      .select('users.id as id, users.name as name, COUNT(date) as shift')
                                      .group('users.id')
        service_engineers = WorkingDay.joins(:user).where("users.role = 9")
                                      .where(date: date.beginning_of_month..date.end_of_month)
                                      .select('users.id as id, users.name as name, COUNT(date) as shift')
                                      .group('users.id')
        technical_engineers = WorkingDay.joins(:user).where("users.department_id = 12")
                                      .where(date: date.beginning_of_month..date.end_of_month)
                                      .select('users.id as id, users.name as name, COUNT(date) as shift')
                                      .group('users.id')

        requests = Request.joins(:request_type).where("request_types.name != 'Другое' AND executor_user_id IS NOT NULL")
                          .where(plan_started_at: date.beginning_of_month..date.end_of_month, plan_finished_at: date.beginning_of_month..date.end_of_month)
                          .select("executor_user_id as id,SUM(age(plan_finished_at,plan_started_at)) as working_time")
                          .group(:executor_user_id).index_by(&:id)

        build_record = lambda do |user, slot_hours, kpi_multiplier|
          fact_time = requests[user.id].present? ? (requests[user.id].working_time.to_f/3600).round(2) : 0
          plan_slots = user.shift * slot_hours
          conversion = plan_slots.positive? ? (fact_time/plan_slots)*100 : 0

          {
            id: user.id,
            name: user.name,
            shift: user.shift,
            plan_slots: plan_slots,
            fact_slots: fact_time,
            conversion: conversion.round(2),
            kpi: ((conversion/10)*kpi_multiplier).round(2)
          }
        end

        append_gross_record = lambda do |records, key, slot_hours, kpi_multiplier|
          total_shift = records.sum { |record| record[:shift].to_i }
          total_plan_slots = total_shift * slot_hours
          total_fact_slots = records.sum { |record| record[:fact_slots].to_f }.round(2)
          total_conversion = total_plan_slots.positive? ? ((total_fact_slots / total_plan_slots) * 100).round(2) : 0
          total_kpi = ((total_conversion / 10) * kpi_multiplier).round(2)

          records << {
            id: "#{key}_gross",
            name: 'Итого:',
            shift: total_shift,
            plan_slots: total_plan_slots,
            fact_slots: total_fact_slots,
            conversion: total_conversion,
            kpi: total_kpi,
            gross: true
          }
        end

        @working_time_by_connect_engineers = connect_engineers.map { |user| build_record.call(user, 8, 5) }
        append_gross_record.call(@working_time_by_connect_engineers, :connect, 8, 5)

        @working_time_by_service_engineers = service_engineers.map { |user| build_record.call(user, 11, 1) }
        append_gross_record.call(@working_time_by_service_engineers, :service, 11, 1)

        @working_time_by_technical_engineers = technical_engineers.map { |user| build_record.call(user, 8, 1) }
        append_gross_record.call(@working_time_by_technical_engineers, :technical, 8, 1)
      end

      def payments_by_month
        date = (Date.parse(params[:date]) rescue Date.today)
        st_date = date.beginning_of_month.strftime("%Y-%m-%d")
        end_date = date.end_of_month.strftime("%Y-%m-%d")

        sql = <<-SQL
          select fl.agrm_id, fl.number, fl.saldo, fl.pay, fl.pay_date
          from (
            select sl.*, ps.pay, ps.pay_date
            from (
                select ts.saldo_id, ag.agrm_id, ag.number, (ts.saldo_internet+ts.saldo_internet_ones+ts.saldo_internet_period+ts.saldo_tv+ts.saldo_tv_ones+ts.saldo_tv_period+ts.saldo_video+ts.saldo_other) as 'saldo'
                from teleset_saldos ts
                join agreements ag on ag.agrm_id = ts.agrm_id
                join accounts ac on ag.uid = ac.uid
                where (ts.date = "#{end_date}")
                    AND ac.type = 2
                    AND number IS NOT NULL
                ) sl
            left JOIN (
                select ps.agrm_id as 'agrm_id', sum(ps.amount) as 'pay', ps.pay_date
                from payments ps
                JOIN pay_classes pc on pc.class_id = ps.class_id
                JOIN agreements ag on ps.agrm_id = ag.agrm_id
                where (buh_date between "#{st_date}" AND "#{end_date}")
                    AND (pc.name LIKE '%$%' OR pc.name LIKE '%Юкасса%')
                group by ps.agrm_id
            ) ps on ps.agrm_id = sl.agrm_id
          ) as fl
        SQL

        # sql = <<-SQL
        #   select ag.number, ps.amount, ps.pay_date, (ts.saldo_internet+ts.saldo_internet_ones+ts.saldo_internet_period+ts.saldo_tv+ts.saldo_tv_ones+ts.saldo_tv_period+ts.saldo_video+ts.saldo_other) as 'saldo', pc.name
        #   from payments ps
        #   JOIN pay_classes pc on pc.class_id = ps.class_id
        #   JOIN agreements ag on ag.agrm_id = ps.agrm_id
        #   JOIN accounts ac on ag.uid = ac.uid
        #   join teleset_saldos ts on ps.agrm_id = ts.agrm_id AND ts.date = "#{end_date}"
        #   where ps.buh_date BETWEEN "#{st_date}" AND "#{end_date}"
        #       AND (pc.name LIKE '%$%' OR pc.name LIKE '%Юкасса%')
        #       AND ac.type = 2
        #   order by ag.agrm_id
        # SQL

        @result = LbAgreement.connection.execute(sql).to_a
      end
    end
  end
end
