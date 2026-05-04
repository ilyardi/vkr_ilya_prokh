class AddRequestTypeToRequestReasons < ActiveRecord::Migration[6.1]
  def change
    add_reference :request_reasons, :request_type, foreign_key: true
    add_reference :request_first_reasons, :request_type, foreign_key: true
  end
end
