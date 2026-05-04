module Api
  module Mango
    class EventsController < BaseController
      before_action :log_request, except: [:other]
      before_action :check_sign

      def phone_call
        if mango_data['call_state'] != 'Appeared' && mango_data['call_state'] != 'Connected'
          render plain: 'ok', status: 200
          return
        end

        # ActionCable.server.broadcast("phone_11316", {:call_number=>"4962129763", :call_state=>"Appeared", :uid=>16468, :name=>"Шинилова Раиса Григорьевна", :phone=>"84962129763", :fax=>"", :address=>"Карла Маркса, 14, 9"})

        call_number = mango_data['from']['number']
        hash = { call_number: call_number, call_state: mango_data['call_state'] }

        accounts = LbAccount.search_by_phone(call_number)
        if account = accounts.first
          hash.merge!(account.to_call_params)
        end

        dial_number = mango_data.dig("to", "extension")
        if dial_number.present?
          ActionCable.server.broadcast("phone_#{dial_number}", hash)
        end
        render plain: 'ok', status: 200
      end

      def ping
        render plain: 'ok', status: 200
      end

      def other
        render plain: 'ok', status: 200
      end

      private

      def log_request
        Rails.logger.warn params.to_enum.to_h.inspect
        Rails.logger.warn mango_data.inspect
      end

      def mango_data
        json = JSON.parse(params[:json]) rescue nil
      end

      def check_sign
        if params[:vpbx_api_key] != MANGO_API_KEY
          Rails.logger.error "Invalid API key: expected #{MANGO_API_KEY}"
          render plain: 'Invalid API key', status: :bad_request
          return
        end

        data = if params[:action] == 'ping'
          params[:data]
        else
          params[:json]
        end

        sign = Digest::SHA256.hexdigest("#{MANGO_API_KEY}#{data}#{MANGO_API_SIGN}")
        if sign != params[:sign]
          Rails.logger.error "Bad sign: expected #{sign}"
          render plain: 'Bad sign', status: :bad_request
          return
        end
      end

    end
  end
end
