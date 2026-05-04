module Lbwidget
  class BaseController < ::ActionController::API
    include LBAuthable

    before_action :authenticate_lb_manager!
  end
end
