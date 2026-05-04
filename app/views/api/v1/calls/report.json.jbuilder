json.months @months.sort_by(&:first).map{|(k,v)| [k.to_i, v]}
json.report @report
#   json.array!(@report) do |(cnt, month, call_reason)|
#     json.cnt cnt
#     json.date month.to_i
#     json.call_reason call_reason
#   end
# end
