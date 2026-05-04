json.(camera,
    :id,
    :token,
    :name,
    :camera_type,
    :secure_token,
    :is_archive,
    :is_private,
    :street,
    :building,
    :longitude,
    :latitude,
    :active,
    :slug,
    :model,
    :serial,
    :mac,
    :ip,
    :description,
    :archive_depth,
    :rtsp_url,
    :server_id,
)
json.url camera.hls_url
unless camera.id.nil?
    json.archive_url archive_api_v1_camera_path(camera)
end

if camera.errors.size > 0
    json.errors camera.errors
end
