module Api
  module V1
    class UsersController < BaseController
      load_and_authorize_resource

      def index
        filter = params[:filter] || {}
        order = params[:order] || 'asc'
        order_by = params[:order_by] || 'id'

        @users = User.all
        @users = @users.active unless filter[:show_all].present?
        @users = @users.where('users.name ILIKE ?', "%#{filter[:name]}%") if filter[:name].present?
        @users = @users.where('users.email ILIKE ?', "%#{filter[:email]}%") if filter[:email].present?
        @users = @users.where(role: filter[:role]) if filter[:role].present?
        @users = @users.order(order_by => order)
        @users = @users.page(page_param).per(per_param) if page_param.present? && per_param.present?
      end

      def show
        @user = User.find(params[:id])
      end

      def create
        new_params = user_params

        if current_user.ability.can?(:manage, User)
          new_params[:department_id] = params[:user][:department_id] if params[:user][:department_id].present?
          new_params[:role] = params[:user][:role] if params[:user][:role].present?
        end

        @user = User.create(new_params)
        set_bad_request(@user)
      end

      def update
        @user = User.find(params[:id])
        new_params = user_params

        if current_user.ability.can?(:manage, User)
          new_params[:department_id] = params[:user][:department_id] if params[:user][:department_id].present?
          new_params[:role] = params[:user][:role] if params[:user][:role].present?
        end

        @user.update(new_params)
        set_bad_request(@user)
      end

      def change_password
        @user = User.find(params[:id])
        unless current_user.ability.can?(:manage, User) || current_user.id == @user.id
          return head :forbidden
        end

        new_params = password_params
        @user.assign_attributes(
          password: new_params[:password],
          check_password: new_params[:check_password],
          pass_changed_at: Date.current
        )
        @user.save(context: :change_password)
        set_bad_request(@user)
      end

      def warehouse_users
        @users = User.active.warehouse_users.order(:name)
      end

      def help_desk_users
        @users = User.active.help_desk_users.order(:name)
      end

      def executors_of_requests
        @users = User.active.executors_of_requests.order(:name)
      end

      private

      def set_bad_request(model)
          if model.errors.size > 0
              render status: :bad_request
          end
      end

      def user_params
          params.require(:user).permit(
              :name,
              :password,
              :email,
              :chat_id,
              :lb_manager_id,
              :active,
          )
      end

      def password_params
        params.require(:user).permit(:password, :check_password)
      end
    end
  end
end
