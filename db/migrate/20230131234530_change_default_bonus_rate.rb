class ChangeDefaultBonusRate < ActiveRecord::Migration[6.1]
  def change
    change_column :abonents, :bonus_rate, :integer, default: 5
  end
end
