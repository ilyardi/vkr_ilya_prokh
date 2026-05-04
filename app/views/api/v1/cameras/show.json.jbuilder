json.camera do
    json.partial! 'camera', camera: @camera
end

json.agreements do
    json.array! @camera.camera_agreements, partial: 'camera_agreement', as: :camera_agreement
end