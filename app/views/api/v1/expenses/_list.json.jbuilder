json.(expense,
  :id,
  :name,
  :description,
  :amount,
  :date_payment,
  :plan_date_payment,
  :flow_rate,
  :repeatable,
  :created_at,
  :updated_at,
  :checked_at,
)

json.author expense.author.get_short_name

json.pay_type I18n.t("models.expense.pay_types.#{expense.pay_type}")
json.status I18n.t("models.expense.statuses.#{expense.status}")
json.expense_purpose expense.expense_purpose&.name
json.expense_company expense.expense_company&.name
json.expense_counterparty expense.expense_counterparty&.name

json.errors expense.errors

# json.executor do
#   if expense.expense_stage.user.present?
#     json.partial! 'api/v1/users/user', user: expense.expense_stage.user
#   else
#     json.partial! 'api/v1/users/user', user: expense.author
#   end
# end

if expense.expense_stage.user.present?
  json.executor expense.expense_stage.user.get_short_name
else
  json.executor expense.author.get_short_name
end

json.expense_type expense.expense_type&.name
json.expense_stage expense.expense_stage&.name
