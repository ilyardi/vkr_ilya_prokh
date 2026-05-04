class ApplicationController < ActionController::Base
  def widget
    render layout: 'widget'
  end

  def mobile
    render layout: 'mobile'
  end
end
