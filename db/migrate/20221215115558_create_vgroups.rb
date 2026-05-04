class CreateVgroups < ActiveRecord::Migration[6.1]
  def change
    create_table :vgroups do |t|
      t.integer :external_id
      t.references :agreement, foreign_key: true
      t.timestamps
    end
  end
end
