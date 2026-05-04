require 'dbf'

module Api
  module V1
    class IrcAccountSaldosController < BaseController
      load_and_authorize_resource

      def index
        filter = params.fetch(:filter)

        @rows = IrcAccountSaldo.order('id asc')

        if v = filter[:agrm_number].presence
          @rows = @rows.where(agrm_number: v)
        end
        if v = filter[:address].presence
          @rows = @rows.where("address ILIKE ?", "#{v}%")
        end
        if v = filter[:agrm_id_type].presence
          (v == "only_empty") && @rows = @rows.where("agrm_id = 0")
          (v == "wo_empty") && @rows = @rows.where("agrm_id != 0")
        end
        if v = filter[:fee_diff].presence
          (v == "true") && @rows = @rows.where("fee != billing_fee")
        end
        if v = filter[:saldo_diff].presence
          (v == "true") && @rows = @rows.where("saldo != billing_saldo")
        end

        @rows = @rows.page(page_param).per(per_param)

        @totals = {
          fee: @rows.sum(:fee),
          billing_fee: @rows.sum(:billing_fee),
          saldo: @rows.sum(:saldo),
          billing_saldo: @rows.sum(:billing_saldo),
        }

        render
      end

      def reload
        @irc_account_saldo.update_billing_data
        # Rails.logger.ap @irc_account_saldo
      end

      def load_file
        # dbf_file = params[:file]

        # added_at = (params[:file_date]) ? Date.parse(params[:file_date]) : Time.now

        # new_payments = []
        # dbf_file.each do |r|
        #   paid_at = r.date_pay
        #   account_number = r.code
        #   amount = r.sum.to_f
        #   source_id = "minbank_ones_#{r.n_pay}"
        #   source_type = "minbank_ones"

        #   next if paid_at.nil? || amount.zero? || account_number.blank?
        #   new_payments << {
        #     source_id:       source_id,
        #     source_type:     source_type,
        #     source_address:  r.address,
        #     account_number:  account_number,
        #     amount:          amount,
        #     paid_at:         paid_at,
        #     added_at:        added_at,
        #     exist:           Payment.exists?(source_id: source_id, source_type: source_type),
        #     data:            { row: r.attributes },
        #   }
        # end

        # if params[:test]
        #   render json: { payments: new_payments }
        #   return
        # else
        #   stats = {
        #     added: 0,
        #     added_amount: 0,
        #   }

        #   Payment.transaction do
        #     new_payments.each do |payment_params|
        #       payment = Payment.find_or_initialize_by(payment_params.slice(:source_id, :source_type))
        #       if payment.persisted?
        #         logger.error "Payment already exist #{payment_params.inspect}"
        #         next
        #       end

        #       payment.update_attributes(payment_params.slice(:account_number, :amount, :paid_at, :added_at, :data))
        #       if payment.errors.size > 0
        #         raise ActiveRecord::Rollback
        #       end
        #       stats[:added] += 1
        #       stats[:added_amount] += payment.amount
        #     end

        #     render json: { stats: stats } and return
        #   end
        # end


        render json: { error: "Error" }, status: :unprocessable
      end


    end
  end
end
