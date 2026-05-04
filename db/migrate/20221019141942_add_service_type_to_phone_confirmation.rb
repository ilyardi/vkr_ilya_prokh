class AddServiceTypeToPhoneConfirmation < ActiveRecord::Migration[6.1]
  def change
    add_column :phone_confirmations, :service_type, :integer, default: 1
  end
end
