class SiteDocument < ApplicationRecord
  ZIP_FILENAME = Rails.root.join("public/teleset_documents.zip")

  mount_uploader :file, SiteDocumentFileUploader
  acts_as_list

  validates :title, :file, presence: true

  scope :active,  -> { where(active: true) }
  scope :ordered, -> { order('position') }

  after_commit on: [:create, :update, :destroy] do
    File.delete(ZIP_FILENAME) if File.exist?(ZIP_FILENAME)
  end
end
