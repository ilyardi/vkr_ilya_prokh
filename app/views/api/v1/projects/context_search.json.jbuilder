json.projects do
    json.array! @projects, partial: 'project', as: :project
end
