class Equipment < ApplicationRecord
  belongs_to :equipment_type
  has_many :equipment_locations, -> {order("created_at DESC")}, dependent: :destroy

  validates :model, :brand, :serial_number, :equipment_type_id, presence: true
  validates :serial_number, :identifier, uniqueness: true
  after_create :set_identifier

  def set_identifier
    update(identifier: "#{self.equipment_type.name[0]}-00000#{self.id}")
  end
end
