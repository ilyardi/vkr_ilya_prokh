module Api
    module V1
        class SearchTemplatesController < BaseController
          def index
            filter = params[:search] || {}
            @search_templates = SearchTemplate.where(user_id: current_user.id)
            @search_templates = @search_templates.where(searchable_type: filter[:searchable_type]) if filter[:searchable_type].present?
          end

          def create
            in_params = search_template_params
            in_params['user_id'] ||= current_user.id
            @search_template = SearchTemplate.create(in_params)
            set_bad_request(@search_template)
          end

          def destroy
            @search_template = SearchTemplate.find(params[:id])
            @search_template.destroy
            set_bad_request(@search_template)
          end

          private

          def set_bad_request(model)
            if model.errors.size > 0
                render status: :bad_request
            end
          end

          def search_template_params
            params.require(:search_template).permit(
              :name,
              :user_id,
              :color,
              :searchable_type,
              search_params: {},
            )
          end
        end
    end
end
