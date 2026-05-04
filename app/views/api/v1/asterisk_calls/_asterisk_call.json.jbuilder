json.(asterisk_call, :id, :start_time, :end_time, :linkedid, :from_num, :to_num, :status)
json.audio_url "/api/v1/asterisk_calls/#{asterisk_call.id}/audio.mp3"
