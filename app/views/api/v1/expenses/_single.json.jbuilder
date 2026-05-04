json.(expense,
    :id,
    :name,
    :description,
    :author_id,
    :pay_type,
    :date_payment,
    :plan_date_payment,
    :expense_type_id,
    :expense_stage_id,
    :expense_purpose_id,
    :expense_counterparty_id,
    :amount,
    :flow_rate,
    :repeatable,
    :created_at,
    :updated_at,
    :expense_company_id,
    :status,
    :repeatable,
    :checked_at,
    )

if expense.errors.size > 0
    json.errors expense.errors
end

users = User.all.index_by(&:id)
expense_types = ExpenseType.all.index_by(&:id)
expense_stages = ExpenseStage.all.index_by(&:id)
expense_purposes = ExpensePurpose.all.index_by(&:id)
expense_companies = ExpenseCompany.all.index_by(&:id)
exepense_statuses = I18n.t("models.expense.statuses")
exepense_pay_types = I18n.t("models.expense.pay_types")

json.events do
    json.array! expense.versions do |event|
        changes = {}
        changeset = event.changeset
        changeset.each_pair { |key, value|
            case key
            when 'expense_type_id'
                changes['expense_type'] = expense_types[value[1]].name
            when 'expense_stage_id'
                changes['expense_stage'] = expense_stages[value[1]]&.name || 'удалено'
            when 'expense_purpose_id'
                changes['expense_purpose'] = expense_purposes[value[1]]&.name || 'удалено'
            when 'expense_company_id'
                changes['expense_company'] = expense_companies[value[1]]&.name || 'удалено'
            when 'author_id'
                changes['author'] = users[value[1]]&.name || 'удалено'
            when 'status'
                changes['status'] = exepense_statuses[value[1]]
            when 'pay_types'
                changes['pay_type'] = exepense_pay_types[value[1]]
            else
                changes[key] = value[1]
            end
        }
        json.changes changes
        json.id event.id
        json.whodunnit users[event.whodunnit.to_i] ? users[event.whodunnit.to_i].name : 'Система'
        json.event event.event
        json.created_at event.created_at
    end
end
