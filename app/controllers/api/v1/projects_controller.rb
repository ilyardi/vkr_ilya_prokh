module Api
  module V1
    class ProjectsController < BaseController
      def index
        filter = params[:filter] || {}
        user_id = current_user&.id.to_s
        available_statuses = ['at_work']
        available_statuses << 'archive' if filter[:archive].present?
        available_statuses << 'decline' if filter[:decline].present?

        @projects = Project.all.includes(:project_type, :project_status, :responsible_user)
        @projects = @projects.where(status: available_statuses)
        @projects = @projects.where("'#{current_user&.id}' = any(project_managers_ids) OR #{current_user&.id} = responsible_user_id") unless (current_user.admin? || current_user.supervisor?)
        @projects = @projects.where('projects.id = ?', filter[:number].to_i) if filter[:number].present?
        @projects = @projects.where('projects.name ILIKE ?', "%#{filter[:name]}%") if filter[:name].present?
        @projects = @projects.where('projects.project_type_id = ?', filter[:project_type_id]) if filter[:project_type_id].present?
        @projects = @projects.where('projects.project_status_id = ?', filter[:project_status_id]) if filter[:project_status_id].present?
        @projects = @projects.where('projects.responsible_user_id = ?', filter[:responsible_user_id]) if filter[:responsible_user_id].present?
        @projects = @projects.where(created_at: filter[:created_at][0]..filter[:created_at][1].to_time.end_of_day) if filter[:created_at].present? && filter[:created_at][0].present?
        @projects = @projects.where(plan_started_at: filter[:doned_at][0]..filter[:doned_at][1].to_time.end_of_day,
            plan_finished_at: filter[:doned_at][0]..filter[:doned_at][1].to_time.end_of_day) if filter[:doned_at].present? && filter[:doned_at][0].present?
        
        
        
        
        if filter[:description].present?
          search_term = "%#{filter[:description]}%"
            @projects = Project.joins(:project_type).where("projects.name ILIKE :search_term OR projects.description ILIKE :search_term OR project_types.name ILIKE :search_term", search_term: search_term)
        end

         

        @projects = @projects.order(created_at: :asc)
        @projects = @projects.page(page_param).per(per_param)


      

        

      end

      def create
        in_params = project_params
        in_params['responsible_user_id'] = current_user.id unless in_params['responsible_user_id'].present?
        @project = Project.create(in_params)
        set_bad_request(@project)
      end

      def show
        @project = Project.find(params[:id])
      end

      def update
        @project = Project.find(params[:id])
        @project.update(project_params)
        set_bad_request(@project)
      end

      def context_search
        context = params[:context]
        @projects = Project.all
        @projects = @projects.where("projects.name ILIKE '%#{context}%'
                                  OR projects.description ILIKE '%#{context}%'
                                  OR CAST(projects.id AS varchar) ILIKE '%#{context}%'") if context.present?
        @projects = @projects.limit(20)
      end

      private

      def set_bad_request(model)
          if model.errors.size > 0
              render status: :bad_request
          end
      end

      def project_params
          params.require(:project).permit(
            :name,
            :description,
            :project_type_id,
            :responsible_user_id,
            :plan_started_at,
            :plan_finished_at,
            :status,
            project_managers_ids:[]
          )
      end
    end
  end
end
