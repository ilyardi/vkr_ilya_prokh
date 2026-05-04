class ChangeBonusRateDefault < ActiveRecord::Migration[6.1]
  def up
    change_column :abonents, :bonus_rate, :integer, default: 2
    execute "UPDATE abonents SET bonus_rate = 2"
  end

  def down
    change_column :abonents, :bonus_rate, :integer, default: 5
    execute "UPDATE abonents SET bonus_rate = 5"
  end
end
