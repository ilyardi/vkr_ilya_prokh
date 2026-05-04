class PortsUpJob < ApplicationJob
    queue_as :default
  
    rescue_from(ActiveRecord::RecordNotFound) do |exception|
      Rails.logger.error "[PortsUpJob] #{exception.message}"
    end
  
    def perform(agrm_id)
        agreement = Agreement.find_by(external_id: agrm_id)
        agreement.ports_up
    end
  end
  