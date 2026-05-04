class CreateLkPayments < ActiveRecord::Migration[6.1]
  def change
    create_table :lk_payments do |t|
      t.integer :agrm_id
      t.string  :invoice_number, null: false
      t.decimal :amount,         null: false

      t.integer :status,         default: 0
      t.integer :ofd_status,     default: 0
      t.integer :lb_status,      default: 0
      t.json    :response
      t.json    :ofd_response
      t.json    :lb_response

      t.string  :order_id
      t.string  :session_id

      t.string  :customer_name
      t.string  :customer_email
      t.string  :customer_phone
      t.string  :customer_address
      t.string  :description
      t.boolean :charge_bonus, default: false
      t.string  :provider
      t.timestamps
    end

    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE lk_payments
            ADD CONSTRAINT provider_check
              CHECK (provider IN ('sberbank', 'minbank'));
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE lk_payments
            DROP CONSTRAINT provider_check
        SQL
      end
    end

    add_index :lk_payments, [:order_id, :session_id], unique: true
  end
end
