class CreateAutoPayments < ActiveRecord::Migration[6.1]
  def change
    create_table :auto_payment_methods do |t|
      t.decimal    :amount,  null: false
      t.datetime   :date,    null: false
      t.references :abonent, null: false
      t.bigint     :agrm_id, null: false
      t.string     :service, null: false, default: 'sberbank'
      t.string     :status,  null: false, default: 'created'
      t.string     :pay_token
      t.string     :merchant_order_id
      t.jsonb      :card,      default: {}
      t.jsonb      :payer_data, default: {}
      t.boolean    :active, default: false, null: false
      t.datetime   :deleted_at
      t.timestamps
    end

    reversible do |dir|
      dir.up do
        execute <<-SQL
          CREATE UNIQUE INDEX auto_payment_unique_idx
            ON auto_payment_methods (agrm_id, abonent_id)
            WHERE (active = true AND deleted_at IS NULL)
        SQL
      end
      dir.down do
        execute <<-SQL
          DROP INDEX auto_payment_unique_idx
        SQL
      end
    end
  end
end
