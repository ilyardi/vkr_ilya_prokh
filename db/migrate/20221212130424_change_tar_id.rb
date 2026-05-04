class ChangeTarId < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE debtors
            DROP COLUMN tar_id
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE debtors
            ADD COLUMN tar_id integer
        SQL
      end
    end
    add_column :debtors, :agrm_type, :string
    add_column :debtors, :tar_ids, :string, array: true
  end
end
