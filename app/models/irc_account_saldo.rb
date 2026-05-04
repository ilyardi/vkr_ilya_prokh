class IrcAccountSaldo < ApplicationRecord
  def update_billing_data
    if self.agrm_id.nil? || self.agrm_id.to_s == "0"
      a = LbAgreement.where('number = ? OR number = ?', self.agrm_number, "0"+self.agrm_number).first
      return if a.nil?
      self.agrm_id = a.agrm_id
    end
    new_fee = LbAgreement.find_by(agrm_id: self.agrm_id).fee(self.date - 1.day).to_f
    new_saldo = LbBalance.find_by(date: self.date, agrm_id: self.agrm_id).try(:balance).to_f*-1
    update(billing_fee: new_fee, billing_saldo: new_saldo + new_fee)
  end
end
