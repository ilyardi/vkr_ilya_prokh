class ReserveSpend < ApplicationRecord
  enum operation_type: { spend: "spend", bonus: "bonus", correction: "correction" }
  enum status: { created: "created", done: "done", declined: "declined" }

  belongs_to :reserve
  after_create :spend

  def decline
    reserve = self.reserve
    reserve.update(balance: reserve.balance + self.amount)
    self.declined! unless reserve.errors.present?
  end

  private

  def spend
    reserve = self.reserve
    reserve.update(balance: reserve.balance - self.amount)
    self.done! unless reserve.errors.present?
  end
end
