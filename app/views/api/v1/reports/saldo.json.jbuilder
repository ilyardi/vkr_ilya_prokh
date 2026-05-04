json.rows do
  json.array! @agreements do |ag|
    json.(ag, :agrm_id, :number)
    json.name ag.read_attribute(:account_name)
    json.address ag.read_attribute(:address)

    json.saldo @saldo[ag.agrm_id]
    json.fee @fee[ag.agrm_id]
    json.payments @payments[ag.agrm_id]
  end
end
