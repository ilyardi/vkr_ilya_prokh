class CreatePageParts < ActiveRecord::Migration[6.1]
  def change
    create_table :page_parts do |t|
      t.string :name, index: true, unique: true
      t.string :content_type
      t.text   :content
      t.timestamps
    end
  end
end
