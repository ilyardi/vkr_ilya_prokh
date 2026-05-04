module Api
  module V1
    class LbAgreementsController < BaseController
      load_and_authorize_resource except: [:show]

      def index
        filter = params[:filter] || {}

        # === ДЕМО-РЕЖИМ: без LanBilling. Список договоров — только демо. ===
        debtors_index = Debtor.where("agrm_id >= ?", DemoLbAgreement::DEMO_AGRM_ID_THRESHOLD).index_by(&:agrm_id)
        decorators    = DemoLbAgreement.all(debtors_index)

        if filter[:number].present?
          decorators = decorators.select { |d| d.number.to_s.include?(filter[:number].to_s) }
        end
        if filter[:name].present?
          decorators = decorators.select { |d| d.lb_account.name.to_s.downcase.include?(filter[:name].to_s.downcase) }
        end
        if filter[:phone].present?
          decorators = decorators.select { |d| d.lb_account.mobile.to_s.include?(filter[:phone].to_s) }
        end

        @lb_agreements = Kaminari.paginate_array(decorators).page(page_param).per(per_param)
      end

      def reconciliation_act
        @lb_agreement = LbAgreement.find(params[:id])

        unless @lb_agreement.present? && params[:period].present? && params[:period][0].present?
          render status: :bad_request, json: {success: false}
          return
        end

        @st_date = Time.parse(params[:period][0]).beginning_of_month
        @end_date = Time.parse(params[:period][1]).end_of_month
        st_date_formated = @st_date.strftime("%Y-%m-%d")
        end_date_formated = @end_date.strftime("%Y-%m-%d")
        @date = Time.new(params[:period][0])
        @lb_account = @lb_agreement.lb_account
        sql = <<-SQL
          select ch.month as date,'Продажа' as document, '' as debit, round(ch.fee, 2) as credit
          from agreements ag
          JOIN teleset_charges ch ON ag.agrm_id = ch.agrm_id
          where ag.agrm_id = '#{@lb_agreement.agrm_id}'
            AND (ch.month BETWEEN "#{st_date_formated}" AND "#{end_date_formated}")
          union
          select pm.pay_date as date, 'Оплата' as document, round(pm.amount, 2) as debit, '' as credit
          from agreements ag
          JOIN payments pm ON ag.agrm_id = pm.agrm_id
          where ag.agrm_id = '#{@lb_agreement.agrm_id}'
            AND (pm.pay_date BETWEEN "#{st_date_formated}" AND "#{end_date_formated}")
          order by date
        SQL

        sql_saldo_before = <<-SQL
          select round(SUM(amount), 2)
          from (
              select SUM(-1*ch.fee) as amount
              from agreements ag
              JOIN teleset_charges ch ON ag.agrm_id = ch.agrm_id
              where ag.agrm_id = '#{@lb_agreement.agrm_id}'
                  AND NOT(ch.fee = 0)
                  AND ch.month < "#{st_date_formated}"
              union
              select SUM(pm.amount) as amount
              from agreements ag
              JOIN payments pm ON ag.agrm_id = pm.agrm_id
              where ag.agrm_id = '#{@lb_agreement.agrm_id}'
                  AND pm.pay_date < "#{st_date_formated}") as sumary_data
        SQL

        @result = LbAgreement.connection.execute(sql).to_a
        @saldo_before = LbAgreement.connection.execute(sql_saldo_before).to_a
        @saldo_before = @saldo_before[0][0].to_i

        @debit = 0
        @credit = 0
        @saldo_current = 0

        @result.each do |record|
          @debit+=record[2].to_f
          @credit+=record[3].to_f
        end
        if @saldo_before < 0
          @saldo_current = @debit - (@credit + @saldo_before.abs)
        else
          @saldo_current = (@debit + @saldo_before.abs) - @credit
        end
      end

      def show
        # === ДЕМО-РЕЖИМ: без LanBilling. Карточка договора — из локальной БД. ===
        agreement = Agreement.find_by(external_id: params[:id])
        raise ActiveRecord::RecordNotFound, "Agreement #{params[:id]} not found" unless agreement

        debtor = Debtor.find_by(agrm_id: params[:id])
        @lb_agreement = DemoLbAgreement.new(agreement, debtor)
        @connections  = []
      end

      def update
        @lb_agreement = LbAgreement.find(params[:id])
        @lb_account = @lb_agreement.lb_account
        @lb_account.update(update_params)
      end

      def fee_payments_report
        @month = (Date.parse(filter_params[:month]) rescue Date.today - 1.month).beginning_of_month
        agrm_ids = nil
        not_agrm_ids = nil
        type = filter_params[:type]
        lb_classes = filter_params[:class_name] ? filter_params[:class_name].map{|v| v.to_i} : ''
        balance_rule = filter_params[:balance].present? ? filter_params[:balance][0] : nil
        pay_rule = filter_params[:payments].present? ? filter_params[:payments][0] : nil

        lk_status = [filter_params[:lk_status]].flatten
        if lk_status.include?('confirmed_lk') && lk_status.include?('unconfirmed_lk')
          agrm_ids = Dogovor.pluck(:agrm_id).uniq
        elsif lk_status.include?('confirmed_lk')
          agrm_ids = Dogovor.where(confirmed: true).pluck(:agrm_id).uniq
        elsif lk_status.include?('unconfirmed_lk')
          agrm_ids = Dogovor.joins('a1 LEFT JOIN dogovors a2 ON a1.agrm_id = a2.agrm_id AND a2.confirmed = true').where('a2.agrm_id IS NULL').pluck('a1.agrm_id').uniq
        elsif lk_status.include?('no_lk')
          not_agrm_ids = Dogovor.pluck(:agrm_id).uniq
        end

        @total_payments = LbAgreement.joins(:lb_payments).includes(:lb_account).where('payments.pay_date BETWEEN ? AND ?', @month + 1.month, (@month + 1.month).end_of_month)
        @lb_agreements = LbAgreement.includes(:lb_account, :lb_teleset_charges)

        if type.present?
          @total_payments = @total_payments.where(accounts: {type: type})
          @lb_agreements = @lb_agreements.where(accounts: {type: type})
        end

        unless agrm_ids.nil?
          @lb_agreements = @lb_agreements.where(agrm_id: agrm_ids)
          @total_payments = @total_payments.where(agrm_id: agrm_ids)
        end
        unless not_agrm_ids.nil?
          @total_payments = @total_payments.where('agreements.agrm_id NOT IN (?)', not_agrm_ids)
        end

        if lb_classes.present?
          @total_payments = @total_payments.where('payments.class_id IN (?)', lb_classes)
          @lb_agreements = @lb_agreements.joins(:lb_payments).where('payments.class_id IN (?) AND (payments.pay_date BETWEEN ? AND ?)',lb_classes, @month + 1.month, (@month + 1.month).end_of_month)
        end

        if balance_rule.present?
          @total_payments = @total_payments.where("balance #{balance_rule} 0")
          @lb_agreements = @lb_agreements.where("balance #{balance_rule} 0")
        end

        @lb_agreements = @lb_agreements.where(teleset_charges: { month: @month })
        @lb_agreements = @lb_agreements.preload(:dogovors)

        if val = [filter_params[:bill_delivery]].flatten
          v = val.map{|q| LbAccount.bill_deliveries[q]}.compact
          if v.size > 0
            @lb_agreements = @lb_agreements.where(accounts: { bill_delivery: v })
            @total_payments = @total_payments.where(accounts: { bill_delivery: v })
          end
        end

        if pay_rule.present?
          paider_ids = @total_payments.pluck(:agrm_id)
          case pay_rule
          when 'paid'
            @lb_agreements = @lb_agreements.where('agreements.agrm_id IN (?)', paider_ids)
          when 'no_paid'
            @lb_agreements = @lb_agreements.where('agreements.agrm_id NOT IN (?)', paider_ids)
            @total_payments = @total_payments.where('agreements.agrm_id NOT IN (?)', paider_ids)
          end
        end

        @total_fee = @lb_agreements.sum('teleset_charges.fee')
        @total_payments_count = @total_payments.count(:agrm_id)
        @total_payments = @total_payments.sum('payments.amount')

        @lb_classes = LbClass.all

        respond_to do |format|
          format.json {
            @lb_agreements = @lb_agreements.page(page_param).per(per_param)
          }
          format.csv{
          }
        end
      end

      def search
        @lb_agreements = LbAgreement.limit(20)
        isSearch = false

        search_params.to_h.each do |k,v|
          isSearch = true if v.presence
        end

        if isSearch
          @lb_agreements = LbAgreement.left_outer_joins(lb_account: {lb_accounts_addrs: [:lb_address_flat, :lb_address_street, :lb_address_building]})
          @lb_agreements = @lb_agreements.where("accounts_addr.type=2 AND accounts.archive = 0 AND agreements.archive = 0")
          @lb_agreements = @lb_agreements.where("accounts.name LIKE ?", "%#{search_params[:fio]}%") if search_params[:fio]
          @lb_agreements = @lb_agreements.where("agreements.number LIKE ?", "%#{search_params[:agreement_number]}%") if search_params[:agreement_number]
          @lb_agreements = @lb_agreements.where("address_street.name = ?", search_params[:street]) if search_params[:street] && search_params[:street] != ""
          @lb_agreements = @lb_agreements.where("address_building.record_id = ?", search_params[:building]) if search_params[:building] && search_params[:building] != ""
          @lb_agreements = @lb_agreements.where("address_flat.name = ?", search_params[:flat]) if search_params[:flat] && search_params[:flat] != ""
        end
      end

      private

      def update_params
        params.require(:agreement).permit(:name, :phone, :mobile, :fax, :descr)
      end

      def filter_params
        params.permit(filter: [:month, :name, :number,{balance: []}, {payments: []}, :type, {bill_delivery: []}, {lk_status: []}, {class_name: []}]).fetch(:filter, {})
      end

      def search_params
        params.permit(search: [:fio, :agreement_number, :street, :building, :flat]).fetch(:search, {})
      end
    end
  end
end