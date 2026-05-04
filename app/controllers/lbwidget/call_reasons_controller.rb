module Lbwidget
  class CallReasonsController < BaseController

    def index
      @call_reasons = CallReason.ordered.active

      render json: @call_reasons.map{|c| c.slice(:id, :name, :group)}
    end

  end
end
