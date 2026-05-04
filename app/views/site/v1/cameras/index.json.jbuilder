json.cameras do
   json.array! @business_cameras do |camera|
    json.(camera, :id, :name, :is_archive, :longitude, :latitude)
    json.archive_days camera.archive_depth
    json.url camera.hls_url
    json.screenshot camera.screenshot_url
    json.archive_url camera.archive_url
    json.category 'business'
  end
  json.array! @abonent_cameras do |camera|
    json.(camera, :id, :name, :is_archive, :longitude, :latitude)
    json.archive_days camera.archive_depth
    json.url camera.hls_url
    json.screenshot camera.screenshot_url
    json.archive_url camera.archive_url
    json.category 'home'
  end
  json.array! @cameras do |camera|
    json.(camera, :id, :name, :is_archive, :longitude, :latitude)
    json.archive_days camera.archive_depth
    json.url camera.hls_url
    json.screenshot camera.screenshot_url
    json.category 'city'
  end
end
