json.agreement @lb_agreement, partial: 'lb_agreement', as: :lb_agreement

if @lb_account.errors.size > 0 
    json.errors @lb_account.errors
end
