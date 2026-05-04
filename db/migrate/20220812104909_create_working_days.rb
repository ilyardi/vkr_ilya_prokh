class CreateWorkingDays < ActiveRecord::Migration[6.1]
  def change
    create_table :working_days do |t|
      t.references :user, foreign_key: true, null: false
      t.datetime :date, null: false
      t.timestamps
    end
  end
end
