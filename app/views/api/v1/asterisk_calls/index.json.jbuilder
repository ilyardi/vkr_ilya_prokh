json.asterisk_calls do
    json.array! @asterisk_calls, partial: 'asterisk_call', as: :asterisk_call
end
  
json.meta do
    json.total @asterisk_calls.total_count
    json.page page_param
    json.per per_param
end