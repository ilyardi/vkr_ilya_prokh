class Product < ApplicationRecord
  include OrderQuery

  mount_uploader :poster, ProductPosterUploader
  mount_uploader :file, ProductFileUploader

  validates :title, presence: true

  scope :published,  -> { where(active: true) }
  order_query :ordered, [:created_at, :desc], [:id, :desc]
end
