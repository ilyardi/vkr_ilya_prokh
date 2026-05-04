json.(teledom_request, :id, :status, :subject, :description, :phone, :user_id, :agrm_id, :created_at)

json.agreement do
  if teledom_request.lb_agreement.present?
    json.partial! 'api/v1/lb_agreements/lb_agreement', lb_agreement: teledom_request.lb_agreement
  end
end
