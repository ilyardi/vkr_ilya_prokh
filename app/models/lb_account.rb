class LbAccount < LbBase
  self.primary_key = :uid
  self.table_name = :accounts
  self.inheritance_column = :inheritance_type

  validates :fax,:phone,:mobile, format: { with: /\A7[\d]{10}\z/, allow_blank: true }

  enum bill_delivery: { email: 4, receipt: 1, all: 2, other: 3, equipment: 0 }, _prefix: true

  has_many :lb_vgroups, foreign_key: :uid
  has_many :lb_accounts_addrs, foreign_key: :uid
  has_many :lb_agreements, foreign_key: :uid
  has_many :calls

  def legal?
    self.type == 1
  end

  def individual?
    self.type == 2
  end

  def from_bill_delivery
    case bill_delivery
    when 'all'
      { accept: true, manual_delivery: true }
    when 'email'
      { accept: true, manual_delivery: false }
    when 'receipt'
      { accept: false, manual_delivery: true }
    else
      { accept: true, manual_delivery: false }
    end
  end

  def set_bill_delivery(email:, receipt:)
    if email && receipt
      # self.bill_delivery_all!
      self.update_column(:bill_delivery, 2)
    elsif email
      # self.bill_delivery_email!
      self.update_column(:bill_delivery, 4)
    elsif receipt
      # self.bill_delivery_receipt!
      self.update_column(:bill_delivery, 1)
    end
  end

  def update_bill_delivery(email:, receipt:)
    cur = from_bill_delivery
    if email != nil
      cur[:accept] = !!email
    end
    if receipt != nil
      cur[:manual_delivery] = !!receipt
    end
    set_bill_delivery(email: cur[:accept], receipt: cur[:manual_delivery])
  end

  def address_connect(as_hash: false)
    self.class.address_connect(self.uid, as_hash: as_hash)
  end

  def to_call_params
    agreement = LbAgreement.find_by(uid: self.uid)
    {
      uid: self.uid,
      name: self.name,
      phone: self.phone,
      fax: self.fax,
      address: self.address_connect,
      agrm_id: agreement ? agreement.agrm_id : nil,
      number: agreement ? agreement.number : nil,
    }
  end

  def last_change_descr
    event = LbEventlog.where("type = 4 && more LIKE '%descr%' && object_id = #{self.uid}").last
    return unless event.present?
    return {
      field: "descr",
      date: event.dt,
      person: event.lb_manager.fio
    }
  end

  class << self
    def address_connect(uid, as_hash: false)
      addr = self.connection.execute("SELECT trim(',' from trim(replace(address_format(2, '#{uid}', '%S, %B, %F'), ' ,', '')))").to_a.flatten.first
      if as_hash
        s, b, f = addr.split(",")
        {
          street: s.strip,
          building: b.strip,
          flat: (f || '').strip,
        }
      else
        addr
      end
    end

    def search_by_phone(phone)
      phones = []
      phones << phone
      phones << phone[-10..-1]
      phones.compact!

      # 4962146925
      # if phone.start_with?('496')
      #   phones << phone[3..-1] # 2146925
      #   phones << phone[5..-1] # 46925
      # end
      # if phone.start_with?('+7')
      #   phones << phone[2..-1]
      # end

      query = []
      query_params = []
      order_query = ""
      phones.each_with_index do |q, i|
        next unless q.present?
        query << "mobile LIKE ?"
        query << "phone LIKE ?"
        query_params << "%#{q}%"
        query_params << "%#{q}%"
        order_query += "WHEN mobile LIKE '%#{q}%' THEN #{i+1} "
        order_query += "WHEN phone LIKE '%#{q}%' THEN #{i+1} "
      end
      order_query += "ELSE #{phones.count + 1} "

      LbAccount.where(query.join(" OR "), *query_params).order(Arel.sql("CASE #{order_query} END"))
    end
  end
end
