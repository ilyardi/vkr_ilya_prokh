class Site::ProductsController < Site::BaseController
  def index
    per_page = 4
    if params[:last_id]
      last_product = Product.published.find_by(id: params[:last_id])
    end

    @products = if last_product
      point = Product.published.ordered_at(last_product)
      point.after.limit(per_page)
    else
      Product.published.ordered.limit(per_page)
    end

    @total = Product.published.count
  end
end
