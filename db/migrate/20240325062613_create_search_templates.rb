class CreateSearchTemplates < ActiveRecord::Migration[6.1]
  def change
    create_table :search_templates do |t|
      t.string :name, null: false
      t.references :user
      t.string :searcheble_type, default: 'Expense'
      t.jsonb :search_params, default: {}
      t.timestamps
    end
  end
end
