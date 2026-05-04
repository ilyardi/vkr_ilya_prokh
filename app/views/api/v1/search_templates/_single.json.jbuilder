json.(search_template, :id, :name,:searchable_type,:search_params,:color)

if search_template.errors.size > 0
  json.errors search_template.errors
end
