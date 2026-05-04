class Channel < ApplicationRecord
  mount_uploader :video_poster, VideoPosterUploader
  mount_uploader :icon, ChannelIconUploader

  validates :number, presence: true

  enum category_id: [:analog, :digital, :iptv]

  scope :ordered, -> { order('number::integer ASC') }
  scope :active, -> { where(active: true) }
end
