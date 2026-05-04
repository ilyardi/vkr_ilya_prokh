class CreateTableDocuments < ActiveRecord::Migration[6.1]
  def change
    create_table :documents do |t|
      t.references :related_obj, polymorphic: true
      t.string :title
      t.string :file
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
