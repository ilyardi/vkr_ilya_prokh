class Site::FaqsController < Site::BaseController
  def index
    @faqs = Faq.ordered.enabled
  end
end
