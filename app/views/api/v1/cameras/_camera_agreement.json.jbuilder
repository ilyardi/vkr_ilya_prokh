json.agrm_id camera_agreement.lb_agreement.agrm_id
json.name    camera_agreement.lb_agreement.lb_account.name
json.number  camera_agreement.lb_agreement.number

if camera_agreement.errors.size > 0
    json.errors camera_agreement.errors
end