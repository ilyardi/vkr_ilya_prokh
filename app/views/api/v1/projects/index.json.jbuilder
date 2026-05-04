json.projects do
    json.array! @projects, partial: 'project', as: :project
end

json.meta do
    json.total @projects.total_count
    json.page page_param
    json.per per_param

end


