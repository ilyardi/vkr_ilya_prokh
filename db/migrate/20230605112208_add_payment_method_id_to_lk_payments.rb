class AddPaymentMethodIdToLkPayments < ActiveRecord::Migration[6.1]
  def change
    add_reference :lk_payments, :auto_payment_method, foreign_key: true
  end
end
