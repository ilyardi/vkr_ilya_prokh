class SearchTemplate < ApplicationRecord
  validates :name, :user_id,:searchable_type, :search_params, presence: true

  enum searchable_type: { lb_agreement: "lb_agreement", expense: "expense", request: "request", project: "project", ast_calls: "ast_calls" }

  belongs_to :user
end
