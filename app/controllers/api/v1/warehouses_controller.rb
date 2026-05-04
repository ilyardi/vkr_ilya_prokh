module Api
  module V1
    class WarehousesController < BaseController
      load_and_authorize_resource

      def index
        @warehouses = Warehouse.all
      end
    end
  end
end
