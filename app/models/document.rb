class Document < ApplicationRecord
    acts_as_paranoid
    mount_uploader :file, DocumentFileUploader
    enum doc_type: {file: 'file', folder: 'folder'}

    belongs_to :related_obj, :polymorphic => true

    validates :title, presence: true
    validates :file, presence: true, if: :file?
end
