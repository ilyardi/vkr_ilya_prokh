json.expense @expense, partial: 'single', as: :expense

# if @expense_template.present?
#   json.expense_template do
#     json.partial! 'api/v1/expense_templates/single', expense_template: @expense_template
#   end
# end
