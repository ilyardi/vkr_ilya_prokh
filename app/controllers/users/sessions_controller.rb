module Users
  class SessionsController < Devise::SessionsController
    before_action :authenticate_user!, only: [:show]
    respond_to :json
  end
end
