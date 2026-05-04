json.channels do
  json.array! @channels do |channel|
    json.(channel, :id, :name, :number, :video_url, :site_url, :description)
    json.video_poster channel.video_poster.url(:normal)
    json.icon channel.icon.url()
  end
end
