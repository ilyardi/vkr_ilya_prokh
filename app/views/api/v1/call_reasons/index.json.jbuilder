json.call_reasons do
  json.array! @call_reasons, partial: 'call_reason', as: :call_reason
end
