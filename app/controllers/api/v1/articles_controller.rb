module Api
  module V1
    class ArticlesController < BaseController
      def index
        filter = params[:search] || {}
        @order = params[:order].presence || 'desc'
        @order_by = params[:order_by].presence || 'created_at'

        @articles = Article.all
        @articles = @articles.where('articles.id = ?', filter[:id].to_i) if filter[:id].present?
        @articles = @articles.where('articles.title ILIKE ?', "%#{filter[:title]}%") if filter[:title].present?
        @articles = @articles.where('articles.active = ?', ActiveModel::Type::Boolean.new.cast(filter[:active])) if filter[:active].present?
        @articles = @articles.where('articles.tags::text ILIKE ?', "%#{filter[:tags]}%") if filter[:tags].present?
        @articles = @articles.where('articles.content ILIKE ?', "%#{filter[:content]}%") if filter[:content].present?
        @articles = @articles.order(@order_by => @order) if @order_by && @order
        @articles = @articles.page(page_param).per(per_param)
      end

      def show
        @article = Article.find(params[:id])
      end

      def update
        @article = Article.find(params[:id])
        @article.update(article_params)
        if @article.errors.present?
          render :show, status: :bad_request
        else
          render :show
        end
      end

      def destroy
        @article = Article.find(params[:id])
        @article.destroy
        head :ok
      end

      private

      def article_params
        params.require(:article).permit(
          :title,
          :content,
          :video_url,
          :active,
          tags: []
        )
      end
    end
  end
end