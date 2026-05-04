module Api
    module V1
      class WarehouseMaterialCategoriesController < BaseController
        load_and_authorize_resource

        def index
          @warehouse_material_categories = WarehouseMaterialCategory.all
        end

        def create
          @warehouse_material_category = WarehouseMaterialCategory.create(category_params)
          unless @warehouse_material_category.persisted?
            render status: :bad_request and return
          end
        end

        private

        def category_params
          params.require(:category).permit(:name)
        end
      end
    end
  end
