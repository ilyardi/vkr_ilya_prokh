class ChangeColumnOnSearchTemplates < ActiveRecord::Migration[6.1]
  def change
    remove_column :search_templates, :searcheble_type
    add_column :search_templates, :searchable_type, :string, default: 'expense'
  end
end
