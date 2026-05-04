class Site::SupportRequestsController < Site::BaseController
  def create
    @support_request = SupportRequest.new(permitted_params)
    render json: { success: @support_request.save }
  end

  private

    def permitted_params
      params.require(:support_request).permit(:phone, :message, :source_type)
    end

end
