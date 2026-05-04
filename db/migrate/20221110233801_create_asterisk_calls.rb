class CreateAsteriskCalls < ActiveRecord::Migration[6.1]
  def change
    create_table :asterisk_calls do |t|
      t.bigint      :asterisk_id
      t.datetime    :start_time
      t.datetime    :start_time_last
      t.datetime    :end_time
      t.string      :linkedid
      t.string      :from_num
      t.string      :to_num
      t.string      :from_chan
      t.string      :to_chan
      t.string      :recordingfile
      t.string      :status
      t.timestamps
    end
  end
end