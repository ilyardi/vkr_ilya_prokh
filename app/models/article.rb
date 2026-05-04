class Article < ApplicationRecord
  include OrderQuery

  mount_uploader :video_poster, VideoPosterUploader
  mount_uploader :poster, PosterUploader

  validates :title, presence: true

  scope :published,  -> { where(active: true) }
  scope :with_tag, ->(tag) { where("tags::jsonb ? '#{tag}'") }
  order_query :ordered, [:created_at, :desc], [:id, :desc]
end
