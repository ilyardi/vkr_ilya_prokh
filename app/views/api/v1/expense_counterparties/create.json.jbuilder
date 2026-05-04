json.expense_counterparty @expense_counterparty

if @expense_counterparty.errors.size > 0
    json.errors @expense_counterparty.errors
end
