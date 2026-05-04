json.records_tv do
    json.array! @tv_records
end

json.records_internet do
    json.array! @int_records
end

json.records_int_tv do
    json.array! @int_tv_records
end

json.records_other do
    json.array! @other_records
end

json.summary_solved_remotely_requests_by_group do
    json.array! @summary_solved_remotely_requests_by_group
end

json.summary_requests_by_group do
    json.array! @summary_requests_by_group
end

json.summary_data_by_time do
    json.array! @summary_data_by_time
end

json.summary_data do
    json.array! @summary_data
end