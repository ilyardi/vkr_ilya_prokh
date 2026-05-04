json.cameras do
  json.array! @cameras do |camera|
    json.(camera, :id, :name, :is_archive, :longitude, :latitude)
    json.url camera.hls_url
    json.screenshot camera.screenshot_url
    json.category 'city'
  end
end
