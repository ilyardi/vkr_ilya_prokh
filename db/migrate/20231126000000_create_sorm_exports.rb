class CreateSormExports < ActiveRecord::Migration[6.1]
  def change
    create_table :sorm_exports do |t|
      t.string      :name,           null: false, unique: true
      t.datetime    :last_export_at, null: false
      t.timestamps
    end
  end
end
