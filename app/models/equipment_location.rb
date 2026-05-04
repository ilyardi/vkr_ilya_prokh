class EquipmentLocation < ApplicationRecord
  belongs_to :location, polymorphic: true
  belongs_to :equipment

  validates :status, :changed_by, :location, presence: true

  acts_as_paranoid
  default_scope { where(deleted_at: nil) }

  enum status: {
    on_check: "На проверке",
    ready_to_issue: "Готов к выдаче",
    defective: "Неисправен",
    not_staffed: "Не укомплектован",
    set: "Установлен",
    requires_verification: "Требует проверки",
    ready_to_install: "Готов к установке",
  }
end
