json.articles do
  json.array! @articles do |article|
    json.(article, :id, :title, :video_url)
    json.content article.content.gsub(/\/uploads\//,"https://teleset.plus/uploads/")
    json.created_at I18n.l(article.created_at, format: '%d %b %Y')
    json.video_poster article.video_poster.url(:normal)
    json.poster article.poster.url(:normal)
    json.tags article.tags
  end
end

json.meta do
  json.total @total
end
