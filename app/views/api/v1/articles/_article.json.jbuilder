json.(article, :id, :title, :content, :video_url, :active, :created_at, :updated_at)
json.video_poster article.video_poster&.url(:normal)
json.poster article.poster&.url(:normal)
json.tags article.tags || []
