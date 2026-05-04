class PhotoUploader < CarrierWave::Uploader::Base
  include CarrierWave::MiniMagick

  storage :file

  before :cache, :store_original_filename
  process :store_dimensions
  process :store_content_type_and_size_in_model

  version :thumb do
    process :resize_to_fit => [200, 200]
    process :convert => 'jpg'
  end

  version :preview do
    process :resize_to_fit => [800, 600]
    process :convert => 'jpg'
  end

  def store_dir
    "uploads/#{model.class.to_s.underscore}/#{mounted_as}/#{model.id}"
  end

  private
    def store_dimensions
      if file && model
        model.file_width, model.file_height = ::MiniMagick::Image.open(file.file)[:dimensions]
      end
    end

    def store_content_type_and_size_in_model
      model.file_type = file.content_type if file.content_type
      model.file_size = file.size
    end

    def store_original_filename(file)
      model.original_filename ||= file.original_filename if file.respond_to?(:original_filename)
    end

  # Provide a default URL as a default if there hasn't been a file uploaded:
  # def default_url
  #   # For Rails 3.1+ asset pipeline compatibility:
  #   # ActionController::Base.helpers.asset_path("fallback/" + [version_name, "default.png"].compact.join('_'))
  #
  #   "/images/fallback/" + [version_name, "default.png"].compact.join('_')
  # end

  # Process files as they are uploaded:
  # process :scale => [200, 300]
  #
  # def scale(width, height)
  #   # do something
  # end


  # Add a white list of extensions which are allowed to be uploaded.
  # For images you might use something like this:
  # def extension_white_list
  #   %w(jpg jpeg gif png)
  # end

  # Override the filename of the uploaded files:
  # Avoid using model.id or version_name here, see uploader/store.rb for details.
  # def filename
  #   "something.jpg" if original_filename
  # end

end
