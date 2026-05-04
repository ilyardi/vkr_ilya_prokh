class Site::ChannelsController < Site::BaseController
  def index
    @channels = Channel.ordered.where(active: true)
    if category_id = params[:category_id]
      @channels = @channels.where(category_id: category_id)
    end
    if tag = params[:tag]
      @channels = @channels.where("tags::jsonb ?& array['#{tag}']")
    end
    @tags = Channel.all.pluck(:tags).flatten.uniq
  end

  def iptv
    @channels = Channel.ordered.where(active: true).where(category_id: 'iptv')
  end

  def iframe
    @channel = Channel.find(params[:id])
    render layout: false
  end
end
