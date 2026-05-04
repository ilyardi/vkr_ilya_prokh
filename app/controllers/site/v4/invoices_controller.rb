module Site
  module V4
    class InvoicesController < ::Site::V4::BaseController
      def index
        @page = (params[:page].presence || 1).to_i
        @per = (params[:per].presence || 20).to_i
        @address = current_abonent.dogovors.confirmed.not_blocked.default.first!
        @invoices = LbOrder.invoices_with_fio.where(agrm_id: @address.agrm_id).order('period DESC').page(@page).per(@per)
      end

      def show
        agrm_ids = current_abonent.dogovors.confirmed.not_blocked.pluck(:agrm_id)
        @invoice = LbOrder.invoices_with_fio.where(agrm_id: agrm_ids).find(params[:id])
        send_file @invoice.file_name, type: 'application/pdf', disposition: 'inline', filename: "#{@invoice.agrm_id}_#{@invoice.period.strftime('%Y-%m')}.pdf"
      end
    end
  end
end
