class CreateSormAccounts < ActiveRecord::Migration[6.1]
  def change
    create_table :sorm_accounts do |t|
      t.string      :row
      t.string      :md5, index: true
      t.datetime    :last_export_at, null: false
      t.timestamps
    end
  end
end
