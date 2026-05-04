module Api
  module V1
    class AsteriskCallsController < BaseController
      def index
          filter = params[:search] || {}
          @order = params[:order].presence || 'desc'
          @order_by = params[:order_by].presence || 'start_time'

          @asterisk_calls = AsteriskCall.all
          @asterisk_calls = @asterisk_calls.where('asterisk_calls.from_num LIKE ?', "%#{filter[:from_num]}%") if filter[:from_num].present?
          @asterisk_calls = @asterisk_calls.where('asterisk_calls.to_num LIKE ?', "%#{filter[:to_num]}%") if filter[:to_num].present?
          @asterisk_calls = @asterisk_calls.where(start_time: filter[:time_range][0].to_time.beginning_of_day..filter[:time_range][1].to_time.end_of_day) if filter[:time_range].present? && filter[:time_range][0].present?
          @asterisk_calls = @asterisk_calls.where(status: filter[:status]) if filter[:status].present?
          @asterisk_calls = @asterisk_calls.order(@order_by => @order).page(page_param).per(per_param)
      end

      def audio
        call = AsteriskCall.find(params[:id])
        data = URI.parse(call.internal_audio_url).open(ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE)
        send_data data.read, filename: "#{call.linkedid}.mp3", type: 'audio/mp3', disposition: 'inline'
      end
    end
  end
end
