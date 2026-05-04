module Api
  module V1
    class PhoneConfirmationsController < BaseController
      def index
          @confirmations = PhoneConfirmation.order('created_at DESC')
      end
    end
  end
end
