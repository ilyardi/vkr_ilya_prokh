json.cameras do
  json.array! @cameras do |camera|
    json.(camera, :id, :name)
    json.url camera.hls_url
    json.screenshot camera.screenshot_url
  end
end

