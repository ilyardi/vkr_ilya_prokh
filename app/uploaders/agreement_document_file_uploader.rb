class AgreementDocumentFileUploader < CarrierWave::Uploader::Base
    storage :file

    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{model.agrm_id}/#{model.doc_type}"
    end

    def filename
      "#{model.doc_type}_#{model.agrm_id}_#{Time.now.strftime("%d_%m_%Y")}.pdf" # If you upload 'file.jpg', you'll get 'image.jpg'
    end
end
