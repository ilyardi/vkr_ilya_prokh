json.articles do
  json.array! @articles, partial: 'article', as: :article
end

json.meta do
  json.total @articles.total_count
  json.page page_param
  json.per per_param
  json.order @order
  json.order_by @order_by
end
