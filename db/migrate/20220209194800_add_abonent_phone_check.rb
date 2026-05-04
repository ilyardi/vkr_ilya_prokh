class AddAbonentPhoneCheck < ActiveRecord::Migration[6.1]
  def up
    execute "ALTER TABLE abonents ADD CONSTRAINT abonents_phone_check CHECK (length(phone) > 0)"
  end

  def down
    execute "ALTER TABLE abonents DROP CONSTRAINT abonents_phone_check"
  end
end


