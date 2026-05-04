

json.lb_tarifs do
  json.array! @lb_tarifs, partial: 'lb_tarif', as: :tarif
end