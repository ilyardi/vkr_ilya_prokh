class AddCommentToBonusCharges < ActiveRecord::Migration[6.1]
  def change
    add_column :bonus_charges, :comment, :string
  end
end
