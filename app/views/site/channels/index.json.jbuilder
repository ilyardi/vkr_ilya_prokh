json.channels do
  json.array! @channels do |channel|
    json.(channel, :id, :name, :number, :frequency, :video_url, :video_html, :site_url, :tags, :category_id, :description)
    if channel.video_url.ends_with?('.m3u8')
      json.video_m3u8 channel.video_url
      json.video_url iframe_api_channel_url(channel)
    end
    json.video_poster channel.video_poster.url(:normal)
    json.icon channel.icon.url()
  end
end

json.tags @tags
