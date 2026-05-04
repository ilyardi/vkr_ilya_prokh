json.(payment, :id, :order_id,
    :customer_name, :customer_phone, :customer_address, :customer_email,
    :amount, :status, :created_at, :updated_at, :status, :ofd_status, :lb_status, :source)

json.agrm_number payment.dogovor
json.paid_date payment.paid_date
json.response JSON.pretty_generate(payment.response) if payment.response.present?
json.ofd_response JSON.pretty_generate(payment.ofd_response) if payment.ofd_response.present?
json.lb_response JSON.pretty_generate(payment.lb_response) if payment.lb_response.present?
json.has_bonus payment.charge_bonus

class_name = 'danger' if payment.paid? || payment.ofd_done? || payment.lb_done?
class_name = 'warning' if payment.paid? && !payment.ofd_empty? && !payment.lb_empty?
class_name = 'success' if payment.paid? && payment.ofd_done? && payment.lb_done?
class_name = 'error' if payment.error? || payment.error? || payment.error?

json.class_name class_name
