build = ->(parent_id) {
  json.array! @faqs.find_all{|f| f.parent_id == parent_id} do |faq|
    json.title faq.title
    json.content faq.content
    json.children do
      build.call(faq.id)
    end
  end
}
json.faqs do
  build.call(nil)
end
