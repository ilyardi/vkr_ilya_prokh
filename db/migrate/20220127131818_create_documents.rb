class CreateDocuments < ActiveRecord::Migration[6.1]
  def change
    create_table :documents do |t|
      t.string :title
      t.string :file
      t.boolean :active, default: true
      t.integer :position
      t.timestamps
    end
  end
end
