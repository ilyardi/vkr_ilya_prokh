class DocumentFileUploader < CarrierWave::Uploader::Base
    storage :file
  
    def store_dir
      "uploads/#{model.class.to_s.underscore}/#{model.related_obj_type.underscore}/#{model.related_obj_id}/#{model.id}"
    end

    def extension_white_list
      %w(pdf doc htm html docx jpg gif)
    end
end
  