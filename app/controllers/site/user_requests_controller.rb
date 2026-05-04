class Site::UserRequestsController < Site::BaseController
  def create
    @user_request = UserRequest.new(permitted_params)
    render json: { success: @user_request.save }
  end

  private

    def permitted_params
      params.require(:user_request).permit(:email, :name, :phone, :address, :source_type)
    end

end
