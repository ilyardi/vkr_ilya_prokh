class CallsChannel < ApplicationCable::Channel
  def subscribed
    # stream_for current_manager
    stream_from "phone_#{params[:phone]}"
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end
end
