class CreateFaqs < ActiveRecord::Migration[6.1]
  def change
    create_table :faqs do |t|
      t.string  :title, null: false
      t.text    :content
      t.boolean :enabled

      # for awesome_nested_set
      t.integer :parent_id, null: true, index: true
      t.integer :lft,       null: false, index: true
      t.integer :rgt,       null: false, index: true

      t.timestamps
    end
  end
end
