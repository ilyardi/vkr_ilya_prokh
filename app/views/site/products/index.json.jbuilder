json.products do
  json.array! @products do |product|
    json.(product, :id, :title, :description, :created_at)
    json.price number_with_precision(product.price, precision: 0, delimiter: ' ')
    json.file_url product.file.url()
    json.poster_url product.poster.url(:normal)
  end
end

json.total @total
