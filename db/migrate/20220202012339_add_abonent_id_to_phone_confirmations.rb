class AddAbonentIdToPhoneConfirmations < ActiveRecord::Migration[6.1]
  def change
    add_reference :phone_confirmations, :abonent, foreign_key: true
  end
end
