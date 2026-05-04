class LbOrder < LbBase
  self.primary_key = :order_id
  self.table_name = :orders

  belongs_to :lb_agreement, foreign_key: :agrm_id

  scope :invoices_with_fio, -> { where(doc_id: [110, 128]) }
  scope :invoices_common, -> { where(doc_id: [127, 129]) }
  scope :invoices, -> { where(doc_id: [110, 127, 128, 129]) }
end
