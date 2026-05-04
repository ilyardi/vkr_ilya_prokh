class CreateChannels < ActiveRecord::Migration[6.1]
  def change
    create_table :channels do |t|
      t.string  :name
      t.string  :number
      t.string  :frequency
      t.string  :site_url
      t.jsonb   :tags, default: []
      t.string  :icon
      t.string  :video_poster
      t.string  :video_url
      t.boolean :active, default: true
      t.integer :category_id, index: true, default: 0
      t.text    :description
      t.text    :video_html
      t.timestamps
    end
  end
end
