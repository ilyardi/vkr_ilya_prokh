json.(expense_template,
    :id,
    :quantity,
    :unit,
    :expense_date,
    :expense_id,
    :created_at,
    :updated_at)

if expense_template.errors.size > 0
    json.errors expense_template.errors
end
