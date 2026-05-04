json.vgroups do
  json.array! @vgroups, partial: 'vgroup', as: :vgroup
end
