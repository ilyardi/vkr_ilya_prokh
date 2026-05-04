module Api
  module V1
    class LbPaymentsController < BaseController
      load_and_authorize_resource

      def index
        @order_by = (params[:order_by].presence || "pay_date")
        @order = (params[:order].presence || "desc")

        fix_order_by = @order_by

        case fix_order_by
        when 'address'
          fix_order_by = "pay_date"
        when 'class_name'
          fix_order_by = "class_id"
        end

        filter = params[:filter] || {}

        @lb_payments = LbPayment.includes(:lb_agreement, :lb_class)
        if filter[:agrm_number].present?
          @lb_payments = @lb_payments.where(agreements: { number: filter[:agrm_number] })
        end
        if filter[:type].present?
          @lb_payments = @lb_payments.account_type(filter[:type])
        end
        @lb_payments = @lb_payments.pay_date(filter[:pay_date]) if filter[:pay_date].present?
        @lb_payments = @lb_payments.local_date(filter[:local_date]) if filter[:local_date].present?
        @lb_payments = @lb_payments.buh_dates(filter[:buh_date]) if filter[:buh_date].present?
        @lb_payments = @lb_payments.lb_class(filter[:lb_classes]) if filter[:lb_classes].present?
        @lb_payments = @lb_payments.where(status: filter[:status]) if filter[:status].present?
        @lb_payments = @lb_payments.where(buh_date: nil) if filter[:empty_buh_date].present?
        @lb_payments = @lb_payments.where(teleset_service_type: filter[:service_type]) if filter[:service_type].present?
        @lb_payments = @lb_payments.where(teleset_service_type: nil) if filter[:empty_service_type].present?

        @total_amount = @lb_payments.sum(:amount)

        @lb_payments = @lb_payments.order(fix_order_by => @order).page(page_param).per(per_param)

        @lb_classes = LbClass.all
      end

      def update
        par = lb_payment_params

        @lb_payment.update(buh_date: par[:buh_date]) unless par[:buh_date].nil?
        @lb_payment.update(teleset_service_type: par[:teleset_service_type]) unless par[:teleset_service_type].nil?
      end

      def batch_update
        ids = Array(params[:ids])
        buh_date = lb_payment_params[:buh_date]
        teleset_service_type = lb_payment_params[:teleset_service_type]
        if ids.size < 0
          render json: { success: false } and return
        end

        unless teleset_service_type.nil?
          LbPayment.where(record_id: params[:ids]).
            joins(lb_agreement: :lb_account).where(lb_account: {type: 1}).
            update_all(teleset_service_type: teleset_service_type)
        end

        unless buh_date.nil?
          LbPayment.where(record_id: params[:ids]).update_all(buh_date: buh_date)
        end

        render json: { success: true }
      end

      def destroy
        if Rails.env.development?
          @lb_payment.status = 2
          @lb_payment.cancel_date = Time.now.strftime("%Y-%m-%d %H:%M:%S")
        else
          record_id = Lanbilling.instance.delete_payment(@lb_payment.record_id)
          @lb_payment.reload
        end
      end

      private

        def lb_payment_params
          params.require(:lb_payment).permit(:buh_date, :teleset_service_type)
        end

    end
  end
end
