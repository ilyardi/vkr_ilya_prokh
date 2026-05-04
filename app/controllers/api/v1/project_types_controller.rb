module Api
    module V1
      class ProjectTypesController < BaseController
        def index 
            @project_types = ProjectType.all
        end
  
        def create
            @project_type = ProjectType.create(project_type_params)
        end

        def update
            @project_type = ProjectType.find(params[:id])
            @project_type.update(project_type_params)
        end

        def destroy
            @project_type = ProjectType.find(params[:id])
            @project_type.update(active: false)
        end
  
        private
  
        def set_bad_request(model)
            if model.errors.size > 0
                render status: :bad_request
            end
        end
    
        def project_type_params
            params.require(:project_type).permit(
              :name,
            )
        end
      end
    end
  end
  