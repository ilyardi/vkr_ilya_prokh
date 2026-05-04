require 'zip'

class Site::DocsController < Site::BaseController
  def index
    @docs = SiteDocument.active.ordered
  end

  def teleset_documents
    zipfilename = SiteDocument::ZIP_FILENAME

    unless File.exist?(zipfilename)
      docs = SiteDocument.active
      Zip::File.open(zipfilename, Zip::File::CREATE) do |zipfile|
        docs.each do |docs|
          # Two arguments:
          # - The name of the file as it will appear in the archive
          # - The original file, including the path to find it
          filename = docs.title.strip + File.extname(docs.read_attribute(:file))
          zipfile.add(filename, docs.file.path)
        end
        zipfile.get_output_stream("myFile") { |os| os.write "myFile contains just this" }
      end
    end

    send_file(zipfilename)
  end
end
