module Api
    module V1
        class DirectoryController < BaseController
          def index
          end

          def user_roles
            render json: {user_roles: User.roles}
          end
        end
    end
end
