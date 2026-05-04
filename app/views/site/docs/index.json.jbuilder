json.docs do
  json.array! @docs do |doc|
    json.(doc, :id, :title)
    json.file_url doc.file.url()
  end
end
