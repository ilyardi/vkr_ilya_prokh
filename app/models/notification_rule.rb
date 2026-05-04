class NotificationRule < ApplicationRecord
    belongs_to :user
    belongs_to :sub_target, :polymorphic => true
end
