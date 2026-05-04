module Api
  module V1
    class AutoPaymentMethodsController < BaseController
      def index
        filter = params[:filter] || {}

        withdraw_at = filter[:withdraw_at] || nil

        @total_sum = 0

        @auto_payment_methods = AutoPaymentMethod.joins(:abonent,:agreement).all
        @auto_payment_methods = @auto_payment_methods.where('agreements.number ILIKE ?', "%#{filter[:agrm_number]}%") if filter[:agrm_number].present?
        @auto_payment_methods = @auto_payment_methods.where('auto_payment_methods.created_at > ?', filter[:created_at_from].to_time.beginning_of_day) if filter[:created_at_from].present?
        @auto_payment_methods = @auto_payment_methods.where('auto_payment_methods.created_at < ?', filter[:created_at_to].to_time.end_of_day) if filter[:created_at_to].present?
        @auto_payment_methods = @auto_payment_methods.where(date: withdraw_at.to_time.beginning_of_month..withdraw_at.to_time.end_of_month) if withdraw_at.present?
        @auto_payment_methods = @auto_payment_methods.where("active = true") if filter[:active].present?
        @auto_payment_methods = @auto_payment_methods.where('abonents.phone ILIKE ?', "%#{filter[:lk_phone]}%") if filter[:lk_phone].present?
        @auto_payment_methods = @auto_payment_methods.where("status = ?", filter[:status]) if filter[:status].present?
        @auto_payment_methods = @auto_payment_methods.where("CAST(auto_payment_methods.id AS text) LIKE ?", "#{filter[:number]}%") if filter[:number].present?


        @total_sum = @auto_payment_methods.sum(:amount).to_s
        @auto_payment_methods = @auto_payment_methods.order('created_at DESC')
        @auto_payment_methods = @auto_payment_methods.page(page_param).per(per_param)
      end
    end
  end
end
