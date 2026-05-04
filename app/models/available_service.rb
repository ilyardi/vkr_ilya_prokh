class AvailableService < ApplicationRecord
  belongs_to :tarif, class_name: "LbTarif", foreign_key: :tar_id
  belongs_to :tarif_free, class_name: "LbTarif", foreign_key: :tar_id_free
  belongs_to :building, class_name: "LbAddressBuilding", foreign_key: :building_id
  enum service_type: {
    teledom_ud: 'teledom_ud'
  }
  validates :tar_id, :tar_id_free, :building_id, :service_type, presence: true
end
