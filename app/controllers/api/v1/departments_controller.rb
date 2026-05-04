module Api
    module V1
        class DepartmentsController < BaseController
            def index
                @departments = Department.all
            end

            def create
              @department = Department.create(department_params)
              set_bad_request(@department)
            end

            def update
              @department = Department.find(params[:id])
              @department.update(department_params)
              set_bad_request(@department)
            end

            def destroy
              @department = Department.find(params[:id])
              @department.update(active: false)
              set_bad_request(@department)
            end

            private

            def department_params
                params.require(:department).permit(
                    :name,
                    :description
                )
            end

            def set_bad_request(model)
                if model.errors.size > 0
                    render status: :bad_request
                end
            end
        end
    end
end
