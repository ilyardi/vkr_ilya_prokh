class CameraAgreement < ApplicationRecord
    belongs_to :camera
    belongs_to :lb_agreement, foreign_key: :agrm_id
    validates :agrm_id, uniqueness: { scope: :camera_id, message: "договор может быть закреплен за камерой только один раз" }
end
