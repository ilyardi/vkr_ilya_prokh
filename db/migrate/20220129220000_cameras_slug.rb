class CamerasSlug < ActiveRecord::Migration["#{ActiveRecord::VERSION::MAJOR}.#{ActiveRecord::VERSION::MINOR}"]
  def up
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    add_column :cameras, :slug, :string, default: -> { "gen_random_uuid()::text" }
    add_index :cameras, :slug, unique: true
  end

  def down
    drop_column :cameras, :slug, :string
  end
end

