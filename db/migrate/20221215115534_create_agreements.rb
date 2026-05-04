class CreateAgreements < ActiveRecord::Migration[6.1]
  def change
    create_table :agreements do |t|
      t.integer :external_id
      t.string :number
      t.timestamps
    end
  end
end
