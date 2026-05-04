module Site
  class ArticlesController < Site::BaseController
    def index
      per_page = params.fetch(:per,2)
      if params[:last_id]
        last_article = Article.find_by(id: params[:last_id])
      end

      @total = Article.published.count

      @articles = if last_article
        point = Article.published.ordered_at(last_article)
        point.after.limit(per_page)
      else
        Article.published.ordered.limit(per_page)
      end
      if tag = params[:tag]
        @articles = @articles.with_tag(tag)
      end
    end

    def show
      @article = Article.find(params[:id])
    end
  end
end
