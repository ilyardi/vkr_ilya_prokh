class ReworkProviderCheck < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE lk_payments
            DROP CONSTRAINT provider_check
        SQL
        execute <<-SQL
          ALTER TABLE lk_payments
            ADD CONSTRAINT provider_check
              CHECK (provider IN ('sberbank', 'yookassa', 'minbank'));
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE lk_payments
            DROP CONSTRAINT provider_check
        SQL
        execute <<-SQL
          ALTER TABLE lk_payments
            ADD CONSTRAINT provider_check
              CHECK (provider IN ('sberbank', 'minbank'));
        SQL
      end
    end
  end
end
