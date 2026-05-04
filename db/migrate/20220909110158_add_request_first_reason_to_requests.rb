class AddRequestFirstReasonToRequests < ActiveRecord::Migration[6.1]
  def change
    add_reference :requests, :request_first_reason, foreign_key: true
  end
end
