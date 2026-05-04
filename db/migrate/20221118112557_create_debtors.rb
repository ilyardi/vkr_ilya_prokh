class CreateDebtors < ActiveRecord::Migration[6.1]
  def change
    create_table :debtors do |t|
      t.integer :agrm_id
      t.integer :balance
      t.integer :tar_id
      t.integer :fee
      t.string :status
      t.references :request
      t.timestamps
    end
  end
end