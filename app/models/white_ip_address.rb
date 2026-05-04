class WhiteIpAddress < ApplicationRecord
    has_paper_trail skip: [:id, :created_at, :updated_at], versions: {
        scope: -> {order('created_at desc')}
    }

    validates :ip, :description, presence: true
    validates :ip, format: { with: /\A[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}\z/,
                             message: "неверный формат IP-адреса" }

    belongs_to :lb_agreement, foreign_key: :agrm_id
    belongs_to :agreement, foreign_key: :agrm_id, primary_key: :external_id
end
