class AddColorToSearchTemplates < ActiveRecord::Migration[6.1]
  def change
    add_column :search_templates, :color, :string, default: 'green'
  end
end
