class CreateArticles < ActiveRecord::Migration[6.1]
  def change
    create_table :articles do |t|
      t.string :title
      t.text   :content
      t.string :poster
      t.string :video_url
      t.string :video_poster
      t.json   :meta, default: {}
      t.json   :tags, default: []
      t.boolean :active, default: true
      t.timestamps
    end
  end
end
