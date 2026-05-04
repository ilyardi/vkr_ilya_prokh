module Api
    module V1
        class WhiteIpAddressesController < BaseController
          load_and_authorize_resource param_method: :wia_params
          def index
            filter = params[:search] || {}
            @order = params[:order].presence || 'desc'
            @order_by = params[:order_by].presence || 'created_at'

            @white_ip_addresses = WhiteIpAddress.left_outer_joins(:agreement)
            @white_ip_addresses = @white_ip_addresses.where('agreements.number ILIKE ?', "%#{filter[:agreement]}%") if filter[:agreement].present?
            @white_ip_addresses = @white_ip_addresses.where('ip ILIKE ?', "#{filter[:ip]}%") if filter[:ip].present?
            @white_ip_addresses = @white_ip_addresses.order(@order_by => @order) if @order_by && @order
            @white_ip_addresses = @white_ip_addresses.page(page_param).per(per_param)
          end

          def show
            @white_ip_address = WhiteIpAddress.find(params[:id])
          end

          def create
            @white_ip_address = WhiteIpAddress.create(wia_params)
            set_bad_request(@white_ip_address)
          end

          def update
            @white_ip_address = WhiteIpAddress.find(params[:id])
            @white_ip_address.update(wia_params)
            set_bad_request(@white_ip_address)
          end

          private

          def set_bad_request(model)
              if model.errors.size > 0
                  render status: :bad_request
              end
          end

          def wia_params
              params.require(:white_ip_address).permit(
                  :ip,
                  :description,
                  :comment,
                  :agrm_id
              )
          end
        end
    end
end
