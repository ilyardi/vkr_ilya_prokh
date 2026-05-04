class AddForeignKeys < ActiveRecord::Migration[6.1]
  def change
    add_foreign_key :dogovors, :abonents
    add_foreign_key :bonus_charges, :lk_payments
    add_foreign_key :camera_agreements, :cameras

    add_foreign_key :cameras_boards, :abonents
    add_foreign_key :cameras_boards, :cameras

    add_foreign_key :lk_payment_users, :lk_payments
    add_foreign_key :lk_payment_users, :abonents
  end
end
