json.(available_service, :id, :service_name, :service_type, :tar_id, :tar_id_free, :building_id, :created_at, :updated_at)

json.tarif "#{available_service.tarif.descr} (id: #{available_service.tar_id})"
json.tarif_free "#{available_service.tarif_free.descr} (id: #{available_service.tar_id_free})"
json.address available_service.building.with_street_name
json.street_id available_service.building.street
