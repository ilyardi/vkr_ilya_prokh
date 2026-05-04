class WarehouseMaterialUniqueName < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<-SQL
          ALTER TABLE public.warehouse_materials
            ADD CONSTRAINT unique_name
              UNIQUE ("name");
        SQL
      end
      dir.down do
        execute <<-SQL
          ALTER TABLE public.warehouse_materials
            DROP CONSTRAINT unique_name
        SQL
      end
    end
  end
end
