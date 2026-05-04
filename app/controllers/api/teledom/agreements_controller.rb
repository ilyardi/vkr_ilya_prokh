module Api
  module Teledom
    class AgreementsController < ::ActionController::API

      def all_rbt_addresses
        result = ::Teledom::Api.new.all_addresses

        if result.success?
          render json: result.data
        else
          render json: { error: "Failed to fetch addresses" }, status: :service_unavailable
        end
      end 

      def billing_stats
        sql_ud = <<-SQL
        select COUNT(*) as total_count
        from agreements ag
        left join accounts ac on ag.uid = ac.uid
        join accounts_addr ad on ag.uid = ad.uid
        join address_flat af on af.record_id = ad.flat
        join address_building ab on ab.record_id = ad.building
        join address_street ast on ast.record_id = ad.street
        join (
          select vg.agrm_id , GROUP_CONCAT(t.descr, '') as tars
          from vgroups vg
          LEFT JOIN tarifs t ON (t.tar_id=vg.tar_id)
          WHERE vg.archive=0 AND vg.blocked = 0
          GROUP BY vg.agrm_id
          ) as vg on ag.agrm_id = vg.agrm_id
        where ad.type=2
          AND ac.archive = 0
          AND ag.archive = 0
          AND tars LIKE "%Умный домофон%"
          AND tars NOT LIKE "%домофон 0%"
        ORDER BY ast.name, ab.name
        SQL
        result_ud = LbDevice.connection.execute(sql_ud).first
        ud_count = result_ud.first || 0

        sql_ad = <<-SQL
        select COUNT(*) as total_count
        from agreements ag
        left join accounts ac on ag.uid = ac.uid
        join accounts_addr ad on ag.uid = ad.uid
        join address_flat af on af.record_id = ad.flat
        join address_building ab on ab.record_id = ad.building
        join address_street ast on ast.record_id = ad.street
        join (
          select vg.agrm_id , GROUP_CONCAT(t.descr, '') as tars
          from vgroups vg
          LEFT JOIN tarifs t ON (t.tar_id=vg.tar_id)
          WHERE vg.archive=0 AND vg.blocked = 0
          GROUP BY vg.agrm_id
          ) as vg on ag.agrm_id = vg.agrm_id
        where ad.type=2
          AND ac.archive = 0
          AND ag.archive = 0
          AND tars LIKE "%ТО домофона%"
        ORDER BY ast.name, ab.name
        SQL
        result_ad = LbDevice.connection.execute(sql_ad).first
        ad_count = result_ad.first || 0

        stats = {
          ud_contracts: ud_count,
          ad_contracts: ad_count
        }

        render json: stats 
      end 

      def reports
        from_date = params[:from] || Date.today.beginning_of_month.to_s
        to_date = params[:to] || Date.today.to_s

        address_params = params.permit(:street_id, :house_id, :entrance_id)
        # return render json: [] if address_params.blank?

        result = ::Teledom::Api.new.reports(from_date, to_date, address_params)

        if result.success?
          render json: result.data || []
        else
          render json: {
          status: 'error',
          message: result.message
        }, status: :unprocessable_entity
        end
      end

      def report_total
        conn = Faraday.new(url: 'http://dom.teleset.plus') do |faraday|
          faraday.request :url_encoded
          faraday.adapter Faraday.default_adapter
        end
        response = conn.get('/internal/teleset/report-total/')
        if response.status == 200
          parsed = JSON.parse(response.body)
          render json: parsed['data']
        else
          render json: { error: "Failed to fetch external stats" }, status: :service_unavailable
        end
      end

      def get_dom_info
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @dom_info = lb_agreement.dom_info
      end

      def block
        lb_agreement = LbAgreement.find_by(number: params[:number])
        success = lb_agreement.dom_block
        unless success
          render status: :bad_request
          return
        end
        render status: 200, json: {success: true}
      end

      def unblock
        lb_agreement = LbAgreement.find_by(number: params[:number])
        success = lb_agreement.dom_unblock
        unless success
          render status: :bad_request
          return
        end
        render status: 200, json: {success: true}
      end

      def add_key
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @errors = {}
        if params[:key][/[А-я]/].present?
          @errors[:key] = "Ключ не должен содержать латиницу"
          render status: :bad_request
          return
        end
        @dom_info = lb_agreement&.dom_add_key(params[:key], params[:message])
        unless @dom_info.present?
          render status: :bad_request
          return
        end
      end

      def sync
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @dom_info = lb_agreement.dom_sync
        unless @dom_info.present?
          render status: :bad_request
          return
        end
      end

      def svn_sync
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @dom_info = lb_agreement.dom_svn_sync
        unless @dom_info.present?
          render status: :bad_request
          return
        end
      end

      def add_subscriber
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @errors = lb_agreement.dom_add_subscriber(subscriber_params)
        @dom_info = lb_agreement.dom_info
        if @errors.present?
          render status: :bad_request
          return
        end
      end

      def del_subscriber
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request
          return
        end
        @errors = lb_agreement.dom_del_subscriber(params[:phone])
        if @errors.present?
          render status: :bad_request
          return
        end
      end

      def send_dom_code
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request, json: {error: "Договор не найден"}
          return
        end
        dom_info = lb_agreement.dom_info
        phone = lb_agreement.lb_account.phone.gsub(/[^\d]/,"")
        unless phone[1] == '9'
          render status: :bad_request, json: {error: "Номер телефона не подходит для рассылки"}
          return
        end
        code = dom_info[:dom_code]
        # code_response = Sms::Message.new.send_code(phone, code)
        # code_response = Sms::Message.new.send_massage(phone, "Код домофона #{code} \nНажмите зелёную трубку-введите код-зелёную трубка ✅")
        code_response = NotiSend::Sms.new.send_message(phone, "Код домофона #{code} \nНажмите зелёную трубку-введите код-зелёную трубка✅")
        unless code_response[0]
          render status: :bad_request, json: {error: code_response[1]}
          return
        end
        render status: 200, json: {success: true}
      end

      def send_dom_key_done
        lb_agreement = LbAgreement.find_by(number: params[:number])
        unless lb_agreement.present?
          render status: :bad_request, json: {error: "Договор не найден"}
          return
        end
        phone = lb_agreement.lb_account.phone.gsub(/[^\d]/,"")
        unless phone[1] == '9'
          render status: :bad_request, json: {error: "Номер телефона не подходит для рассылки"}
          return
        end
        # code_response = Sms::Message.new.send_massage(phone, "Ключи от домофона готовы и ждут Вас на Боголюбова 16")
        code_response = NotiSend::Sms.new.send_message(phone, "Ключи от домофона готовы и ждут Вас на Боголюбова 16")
        unless code_response[0]
          render status: :bad_request, json: {error: code_response[1]}
          return
        end
        render status: 200, json: {success: true}
      end

      private

      def subscriber_params
        params.require(:subscriber).permit(:name, :patronymic, :last, :phone, :owner, :strict_mode, :service)
      end
    end
  end
end
