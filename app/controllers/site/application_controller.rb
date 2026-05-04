module Site
  class ApplicationController < ActionController::Base
    rescue_from ActionController::UnknownFormat do |e|
      render plain: 'record_not_found', status: 404
    end

    rescue_from NoMethodError do |e|
      render plain: 'record_not_found', status: 404
    end

    def page_part
      part_name = request.url.sub(/.*?\/page_parts\//,'')
      part = PagePart.where(name: part_name).first

      if part.content_type == 'json'
        render json: ActiveSupport::JSON.decode(part.content)
        return
      end

      if part
        json = ActiveSupport::JSON.decode(CGI.unescapeHTML(part.content)) rescue nil
        respond_to do |format|
          format.json { render json: json }
          format.html { render plain: part.content }
        end
        return
      end

      if request.referer.include?(root_url)
        PagePart.create(name: part_name)
      end

      render nothing: true
    end

    def apps
      render layout: false, action: 'mobile_apps'
    end

    # def employee_ability
    #   @employee_ability ||= ManagementAbility.new(current_employee || Employee.new)
    # end
  end
end
