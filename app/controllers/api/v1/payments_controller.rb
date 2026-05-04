require 'dbf'

module Api
  module V1
    class PaymentsController < BaseController
      load_and_authorize_resource

      def index
        filter = params.fetch(:filter)

        @payments = Payment.order('added_at desc, id desc')

        if v = filter[:status].presence
          if ['empty', 'error', 'done', 'cancelled', 'unprocessable'].include?(v)
            @payments = @payments.where(status: (v == 'empty') ? [v, 'error'] : v)
          end
        end
        if v = filter[:ofd_status].presence
          if ['ofd_empty', 'ofd_error', 'ofd_done', 'ofd_unprocessable'].include?(v)
            @payments = @payments.where(ofd_status: (v == 'empty') ? [v, 'error'] : v)
          end
        end
        if v = filter[:source_type].presence
          if Payment::SOURCE_TYPES.include?(v)
            @payments = @payments.where(source_type: v)
          end
        end
        [:source_id,  :account_number, :paid_at, :banknam, :amount].each do |field|
          if v = filter[field].presence
            @payments = @payments.public_send(:"search_by_#{field}", v)
          end
        end

        @payments = @payments.page(page_param).per(per_param)

        render
      end

      def resend_errors
        @payments = Payment.error
        @payments.map(&:async_send)
        render json: { resend: @payments.count }
      end

      def resend
        @payment = Payment.find(params[:id])
        @payment.send_to_lanbilling
        render
      end

      def load_sberbank
        data = params[:file].read.force_encoding('cp1251').encode('utf-8')
        rows = data.split(/\r?\n/).map do |r|
          r.split(';')
        end

        added_at = (params[:file_date]) ? Date.parse(params[:file_date]) : Time.now

        new_payments = []
        rows.each do |r|
          next if r.size <= 6

          paid_at = Time.parse("#{r[0]} #{r[1].gsub('-',':')}")
          source_id = r[4]
          account_number = r[5]
          source_address = r[6]
          amount = r[7].sub(',','.').to_f
          source_type = "sber"

          new_payments << {
            source_id:       source_id,
            source_type:     source_type,
            source_address:  source_address,
            account_number:  account_number,
            amount:          amount,
            paid_at:         paid_at,
            added_at:        added_at,
            exist:           Payment.exists?(source_id: source_id, source_type: source_type),
            data:            { row: r },
          }
        end

        if params[:test]
          render json: { payments: new_payments }
          return
        else
          stats = {
            added: 0,
            added_amount: 0,
          }
          Payment.transaction do
            new_payments.each do |payment_params|
              payment = Payment.find_or_initialize_by(payment_params.slice(:source_id, :source_type))
              if payment.persisted?
                logger.error "Payment already exist #{payment_params.inspect}"
                next
              end

              payment.update(payment_params.slice(:source_address, :account_number, :amount, :paid_at, :added_at, :data))
              if payment.errors.size > 0
                raise ActiveRecord::Rollback
              end
              stats[:added] += 1
              stats[:added_amount] += payment.amount
            end

            render json: { stats: stats } and return
          end
        end

        render json: { error: "Error" }, status: :unprocessable
      end

      def load_rschet
        rows = params[:file].read.split(/\r?\n/).map do |r|
          r.try(:force_encoding,'utf-8').split(/[,\t;]/)
        end

        added_at = (params[:file_date]) ? Date.parse(params[:file_date]) : Time.now

        new_payments = []
        rows.each do |r|
          next if r.size < 3

          paid_at = Time.parse(r[0]) rescue nil
          account_number = r[1]
          amount = r[2].to_f
          source_id = "#{r[0].gsub(/[\.\-]/,'')}-#{r[1]}-#{r[2]}"
          source_type = "rschet"

          next if paid_at.nil? || amount.zero? || account_number.blank?
          new_payments << {
            source_id:       source_id,
            source_type:     source_type,
            account_number:  account_number,
            amount:          amount,
            paid_at:         paid_at,
            added_at:        added_at,
            exist:           Payment.exists?(source_id: source_id, source_type: source_type),
            data:            { row: r },
          }
        end

        if params[:test]
          render json: { payments: new_payments }
          return
        else
          stats = {
            added: 0,
            added_amount: 0,
          }

          Payment.transaction do
            new_payments.each do |payment_params|
              payment = Payment.find_or_initialize_by(payment_params.slice(:source_id, :source_type))
              if payment.persisted?
                logger.error "Payment already exist #{payment_params.inspect}"
                next
              end

              payment.update(payment_params.slice(:account_number, :amount, :paid_at, :added_at, :data))
              if payment.errors.size > 0
                raise ActiveRecord::Rollback
              end
              stats[:added] += 1
              stats[:added_amount] += payment.amount
            end

            render json: { stats: stats } and return
          end
        end


        render json: { error: "Error" }, status: :unprocessable
      end

      def load_minbank_ones
        dbf_file = DBF::Table.new(StringIO.new(params[:file].read))

        added_at = (params[:file_date]) ? Date.parse(params[:file_date]) : Time.now

        new_payments = []
        dbf_file.each do |r|
          paid_at = r.date_pay
          account_number = r.code
          amount = r.sum.to_f
          source_id = "minbank_ones_#{r.n_pay}"
          source_type = "minbank_ones"

          next if paid_at.nil? || amount.zero? || account_number.blank?
          new_payments << {
            source_id:       source_id,
            source_type:     source_type,
            source_address:  r.address,
            account_number:  account_number,
            amount:          amount,
            paid_at:         paid_at,
            added_at:        added_at,
            exist:           Payment.exists?(source_id: source_id, source_type: source_type),
            data:            { row: r.attributes },
          }
        end

        if params[:test]
          render json: { payments: new_payments }
          return
        else
          stats = {
            added: 0,
            added_amount: 0,
          }

          Payment.transaction do
            new_payments.each do |payment_params|
              payment = Payment.find_or_initialize_by(payment_params.slice(:source_id, :source_type))
              if payment.persisted?
                logger.error "Payment already exist #{payment_params.inspect}"
                next
              end

              payment.update(payment_params.slice(:account_number, :amount, :paid_at, :added_at, :data))
              if payment.errors.size > 0
                raise ActiveRecord::Rollback
              end
              stats[:added] += 1
              stats[:added_amount] += payment.amount
            end

            render json: { stats: stats } and return
          end
        end


        render json: { error: "Error" }, status: :unprocessable
      end


    end
  end
end
