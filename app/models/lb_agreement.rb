class LbAgreement < LbBase
  self.primary_key = :agrm_id
  self.table_name = :agreements
  self.inheritance_column = :inheritance_type

  belongs_to :lb_account, foreign_key: :uid
  has_many :saldos, foreign_key: :agrm_id
  has_many :lb_payments, foreign_key: :agrm_id
  has_many :lb_rentcharges, foreign_key: :agrm_id
  has_many :lb_usbox_charges, foreign_key: :agrm_id
  has_many :lb_charges, foreign_key: :agrm_id
  has_many :equipment_locations, as: :location
  has_many :lb_vgroups, foreign_key: :agrm_id
  has_one :lb_teleset_agreement, foreign_key: :agrm_id
  has_many :lb_teleset_charges, foreign_key: :agrm_id
  has_many :dogovors, foreign_key: :agrm_id
  has_many :camera_agreements, dependent: :destroy
  has_one :bonus, foreign_key: :agrm_id
  has_many :requests, :as => :resource
  has_many :blocking_services, foreign_key: :agrm_id

  # has_many :abonent, through: :dogovors

  scope :search_by_address_ids, ->(street_id, building_id,  flat) {
    joins(lb_account: {lb_accounts_addrs: [:lb_address_flat, :lb_address_street, :lb_address_building]}).
      where('address_street.record_id = ?
        AND address_building.record_id = ?
        AND address_flat.name = ?
        AND accounts_addr.type=2
        AND accounts.archive = 0
        AND number IS NOT NULL', street_id, building_id, flat)
  }
  scope :search_by_number, -> (v) { where(number: v) }
  scope :search_by_agrm_id, -> (v) { where(agrm_id: v) }
  scope :search_by_address, ->(street, building,  flat) {
    joins(lb_account: {lb_accounts_addrs: [:lb_address_flat, :lb_address_street, :lb_address_building]}).
      where('address_street.name = ?
        AND address_building.name = ?
        AND address_flat.name = ?
        AND accounts_addr.type=2
        AND accounts.archive = 0
        AND number IS NOT NULL', street, building, flat)
  }
  scope :search_by_login, ->(login, pass) {
    joins(:lb_account).where('accounts.login = ? AND accounts.pass = ?', login, pass)
  }

  delegate :name, to: :lb_account

  def lk_status?
    self.dogovors.any?{|a| a.confirmed}
  end

  def lk_status
    s = self.dogovors.map{|a| a.confirmed}
    if s.include?(true)
      :confirmed_lk
    elsif s.include?(false)
      :unconfirmed_lk
    else
      :no_lk
    end
  end

  def lk_addresses
    self.dogovors
  end

  def dom_info
    # unless Rails.env.production?
    #   dom = {
    #       blocked: false,
    #       intercom_blocked: false,
    #       admin_blocked:false,
    #       keys: [
    #         {keyId: 535, rfId: "040E64723D7780", accessType: 2, accessTo: 146, lastSeen: nil, comments: ""},
    #         {keyId: 497, rfId: "043337823D7780", accessType: 2, accessTo: 146, lastSeen: 1741185555, comments: ""},
    #         {keyId: 498, rfId: "04684E823D7780", accessType: 2, accessTo: 146, lastSeen: 1734623083, comments: ""}
    #       ],
    #       dom_code: '33322',
    #       dogovor: '7374774',
    #       login: 'login',
    #       password: 'password',
    #       subscribers: [
    #         {name: "Чепурнов Владимир Федорович", patronymic: nil, last: nil, phone: "79163714849", owner: true},
    #         {name: "Станислава", patronymic: nil, last: nil, phone: "79163441724", owner: true}
    #       ],
    #       entrances: [
    #         {"entranceId"=>4, "apartment"=>29, "apartmentLevels"=>"", "domophoneId"=>3, "matrix"=>1, "url"=>"http://172.29.0.3"},
    #         {"entranceId"=>4, "apartment"=>29, "apartmentLevels"=>"", "domophoneId"=>4, "matrix"=>1, "url"=>"https://172.29.0.4"}
    #       ]
    #     }
    #   return dom
    # end
    dom_api = Teledom::Api.new
    res = dom_api.dom_info(self)
    res.get_dom_info
  end

  def dom_sync
    dom_api = Teledom::Api.new
    res = dom_api.dom_sync(self)
    res.get_dom_info
  end

  def dom_de_sync
    dom_api = Teledom::Api.new
    res = dom_api.dom_de_sync(self)
    res.get_dom_info
  end

  def dom_svn_sync
    dom_api = Teledom::Api.new
    res = dom_api.dom_svn_sync(self)
    res.get_dom_info
  end

  def dom_add_key(key, message)
    dom_api = Teledom::Api.new
    res = dom_api.dom_add_key(self, key, message)
    res.get_dom_info
  end

  def dom_add_subscriber(params)
    errors = {}

    if params[:strict_mode]
      errors[:name] = "Не может быть пустым" unless params[:name].present?
      errors[:patronymic] = "Не может быть пустым" unless params[:patronymic].present?
      errors[:last] = "Не может быть пустым" unless params[:last].present?
    end

    errors[:phone] = "Неверный номер телефона" unless params[:phone].to_s =~ /\A79[\d]{9}\z/

    unless errors.present?
      dom_api = Teledom::Api.new
      res = dom_api.dom_add_subscriber(self, params[:phone], params[:owner], params[:name], params[:patronymic], params[:last])
      if res.success?
        case params[:service]
        when "ud"
          NotiSend::Sms.new.send_message(params[:phone], "Услуга Телесеть.Дом подключена\nhttps://teleset.plus/teleset-dom.html")
        when "promo"
          NotiSend::Sms.new.send_message(params[:phone], "Промо Телесеть.Дом активирован\nhttps://teleset.plus/teleset-dom.html")
        when "svn"
          NotiSend::Sms.new.send_message(params[:phone], "Доступ к камерам в ЛК Телесеть\nhttps://teleset.plus/teleset-dom.html")
        end
      else
        errors[:base] = "Ошибка добавления подписчика!"
      end
    end
    errors
  end

  def dom_del_subscriber(phone)
    errors = {}
    errors[:phone] = "Не указан номер телефона" unless phone.present?
    unless errors.present?
      dom_api = Teledom::Api.new
      res = dom_api.dom_del_subscriber(self, phone)
      errors[:base] = "Ошибка удаления подписчика!" unless res.success?
    end
    errors
  end

  def dom_block
    dom_api = Teledom::Api.new
    res = dom_api.dom_block(self)
    res.success?
  end

  def dom_unblock
    dom_api = Teledom::Api.new
    res = dom_api.dom_unblock(self)
    res.success?
  end

  def params_for_dom
    account = self.lb_account
    lb_agreement_addr = account.lb_accounts_addrs.find_by(type: 2)

    building = lb_agreement_addr.lb_address_building
    building_block = building.block.presence
    building_name = building.name

    street = lb_agreement_addr.lb_address_street&.name
    formated_building = [building_name, building_block].compact.join("/")
    flat = lb_agreement_addr.lb_address_flat&.name

    params = {
      street: street,
      building: formated_building,
      flat: flat,
      number: self.number,
      phone: account.phone,
      name: account.name,
      login: account.login,
      password: account.pass,
    }
  end

  def fee_by_group(month:)
    fee_result = {
      tv: [],
      tv_ones: [],
      tv_period: [],
      internet: [],
      internet_ones: [],
      internet_period: [],
      video: [],
      ud: [],
      to_dom: [],
      other: [],
    }
    date = month.beginning_of_month.strftime('%Y-%m-%d')

    begin
      sql = <<-SQL
        select
          uc.agrm_id,
          uc.c_date,
          sum(uc.amount) as amount,
          t.type as tarif_type,
          t.descr as tarif_descr,
          c.cat_idx,
          c.descr as service_descr,
          c.common as rent_period
        from usbox_charge uc
        JOIN usbox_services us USING(serv_id)
        JOIN categories c USING(tar_id,  cat_idx)
        JOIN tarifs t USING(tar_id)
        where uc.amount > 0 and uc.c_date = '#{date}' and uc.agrm_id = #{self.agrm_id}
        group by uc.agrm_id, uc.c_date, t.type, t.descr, c.cat_idx, c.descr;
      SQL
      result = self.class.connection.exec_query(sql).to_a

      result.each do |r|
        if r['tarif_descr'].downcase.include?('видеонаблюдение')
          fee_result[:video] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        if r['tarif_descr'].downcase.include?('умный домофон')
          fee_result[:ud] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        if r['tarif_descr'].downcase.include?('то домофона')
          fee_result[:to_dom] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        case r['tarif_type']
        when 1 then
          key = (r['rent_period'] == 0) ? :internet_ones : :internet_period
          fee_result[key] << { amount: r['amount'], name:  r['service_descr'] }
        when 5 then
          if r['cat_idx'] == 0
            fee_result[:tv] << { amount: r['amount'], name:  r['service_descr']}
          else
            key = (r['rent_period'] == 0) ? :tv_ones : :tv_period
            fee_result[key] << { amount: r['amount'], name:  r['service_descr']}
          end
        else
          fee_result[:other] << { amount: r['amount'], name:  r['service_descr']}
        end
      end
    end

    begin
      sql = <<-SQL
        select c.agrm_id, c.c_date, sum(c.amount*c.mul) as amount, t.descr as tarif_descr
        from rentcharge c
        JOIN tarifs t USING(tar_id)
        where c.amount > 0 and c.c_date = '#{date}' and c.agrm_id = #{self.agrm_id}
        group by c.agrm_id, c.c_date, t.descr;
      SQL
      result = self.class.connection.exec_query(sql).to_a
      result.each do |r|
        fee_result[:internet] << { amount: r['amount'], name:  r['tarif_descr']}
      end
    end

    begin
      sql = <<-SQL
        select
          c.agrm_id
          , DATE_FORMAT(c.period, '%Y-%m-01') as c_date
          , sum(c.amount) as amount
          , t.type as tarif_type
          , t.descr as tarif_descr
          , sc.serv_cat_idx
          , sc.descr as service_descr
          , sc.rent_period
        from charges c
        LEFT JOIN services s USING(service_id)
        LEFT JOIN service_categories sc ON s.tar_id = sc.tar_id and s.serv_cat_idx = sc.serv_cat_idx
        LEFT JOIN tarifs t ON sc.tar_id = t.tar_id
        where c.amount > 0 and DATE_FORMAT(c.period, '%Y-%m-01') = '#{date}' and c.agrm_id = #{self.agrm_id}
        group by c.agrm_id, c_date, t.tar_id, t.type, t.descr, sc.serv_cat_idx, sc.descr;
      SQL
      result = self.class.connection.exec_query(sql).to_a
      result.each do |r|
        if r['tarif_descr'].downcase.include?('видеонаблюдение')
          fee_result[:video] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        if r['tarif_descr'].downcase.include?('то домофона')
          fee_result[:to_dom] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        if r['tarif_descr'].downcase.include?('умный домофон')
          fee_result[:ud] << { amount: r['amount'], name:  r['service_descr'] }
          next
        end

        case r['tarif_type']
        when 1 then
          key = (r['rent_period'] == 0) ? :internet_ones : :internet_period
          fee_result[key] << { amount: r['amount'], name:  r['service_descr']}
        when 5 then
          if r['service_descr'].start_with?('ТВ ')
            fee_result[:tv] << { amount: r['amount'], name:  r['service_descr']}
          else
            key = (r['rent_period'] == 0) ? :tv_ones : :tv_period
            fee_result[key] << { amount: r['amount'], name:  r['service_descr']}
          end
        else
          fee_result[:other] << { amount: r['amount'], name:  r['service_descr']}
        end
      end
    end

    fee_result
  end


  def fee_internet(month:)
    self.lb_rentcharges.where(c_date: month.beginning_of_month).sum("amount*mul")
    # sql = <<-SQL
    #   SELECT c.vg_id, c.c_date, SUM(c.amount*c.mul) as fee, t.descr
    #   FROM rentcharge c
    #   JOIN tarifs t ON c.tar_id = t.tar_id
    #   WHERE 1=1
    #     AND c.c_date = date('2020-04-01')
    #     AND c.agrm_id = #{self.agrm_id}
    #   GROUP BY c.vg_id, c.c_date, t.descr;
    # SQL
  end

  def fee_tv(month:)
    self.lb_usbox_charges.where(c_date: month.beginning_of_month).sum("amount")
    # sql = <<-SQL
    #   SELECT c.vg_id, c.c_date, SUM(c.amount) as fee, t.descr, t.type
    #   FROM usbox_charge c
    #   JOIN vgroups vg ON c.vg_id = vg.vg_id
    #   JOIN tarifs t ON vg.tar_id = t.tar_id
    #   WHERE 1=1
    #   --  AND c.c_date = date('2020-04-01')
    #     AND c.agrm_id = #{self.agrm_id}
    #   GROUP BY c.vg_id, c.c_date, t.descr, t.type;
    # SQL
  end

  def fee_other(month:)
    month = Date.parse(month) if month.is_a?(String)

    self.lb_charges
      .joins(:lb_vgroup)
      .where('period BETWEEN ? AND ?', month.beginning_of_month, month.end_of_month)
      .group('vgroups.id').sum("amount")
    # sql = <<-SQL
    #   SELECT c.vg_id, c.period, SUM(c.amount) as fee, t.descr, t.type
    #   FROM charges c
    #   JOIN vgroups vg ON c.vg_id = vg.vg_id
    #   JOIN tarifs t ON vg.tar_id = t.tar_id
    #   WHERE 1=1
    #   --  AND c.c_date = date('2020-04-01')
    #     AND c.agrm_id = #{self.agrm_id}
    #   GROUP BY c.vg_id, DATE_FORMAT(c.period, "%Y%m"), t.descr, t.type;
    # SQL
  end

  def fee(month = Date.today)
    date = month.beginning_of_month.strftime("%Y-%m-%d")

    sql = <<-SQL
      SELECT a.agrm_id, (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) as fee
      FROM agreements a
      LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM rentcharge WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 AND agrm_id = #{self.agrm_id} GROUP BY agrm_id) r ON a.agrm_id = r.agrm_id
      LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM usbox_charge WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 AND agrm_id = #{self.agrm_id} GROUP BY agrm_id) u ON a.agrm_id = u.agrm_id
      LEFT JOIN (
        SELECT agrm_id, sum(amount) as fee
        FROM charges c
        JOIN services s ON c.service_id=s.service_id
        JOIN service_categories sc ON s.tar_id = sc.tar_id AND s.serv_cat_idx = sc.serv_cat_idx
        WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 -- AND sc.rent_period != 0
        AND agrm_id = #{self.agrm_id}
        GROUP BY agrm_id
      ) c ON a.agrm_id = c.agrm_id
      WHERE (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) > 0 AND a.agrm_id = #{self.agrm_id}
      GROUP BY a.agrm_id
    SQL

    result = LbAgreement.connection.execute(sql).to_a

    result.each_with_object({}) do |r, memo|
      memo[r[0]] = r[1]
    end[self.agrm_id]
  end

  def fee_by_period(from = Date.today.beginning_of_month, to = Date.today.end_of_month)
    sql = <<-SQL
      SELECT a.agrm_id, (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) as fee
      FROM agreements a
      LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM rentcharge WHERE period >= date('#{from}') and period < '#{to}' + interval 1 month AND amount > 0 AND agrm_id = #{self.agrm_id} GROUP BY agrm_id) r ON a.agrm_id = r.agrm_id
      LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM usbox_charge WHERE period >= date('#{from}') and period < '#{to}' + interval 1 month AND amount > 0 AND agrm_id = #{self.agrm_id} GROUP BY agrm_id) u ON a.agrm_id = u.agrm_id
      LEFT JOIN (
        SELECT agrm_id, sum(amount) as fee
        FROM charges c
        JOIN services s ON c.service_id=s.service_id
        JOIN service_categories sc ON s.tar_id = sc.tar_id AND s.serv_cat_idx = sc.serv_cat_idx
        WHERE period >= date('#{from}') and period < '#{to}' + interval 1 month AND amount > 0 -- AND sc.rent_period != 0
        AND agrm_id = #{self.agrm_id}
        GROUP BY agrm_id
      ) c ON a.agrm_id = c.agrm_id
      WHERE (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) > 0 AND a.agrm_id = #{self.agrm_id}
      GROUP BY a.agrm_id
    SQL

    result = LbAgreement.connection.execute(sql).to_a

    result.each_with_object({}) do |r, memo|
      memo[r[0]] = r[1]
    end[self.agrm_id]
  end

  def get_tariffs
    addons = []

    sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
      SELECT s.vg_id, c.descr as descr, round(s.mul*c.above, 2) as amount, t.rent, vg.blocked, vg.acc_ondate, vg.acc_offdate, vg.last_mod_date, s.serv_cat_idx as cat_idx
      FROM services s
      JOIN service_categories c USING (tar_id, serv_cat_idx)
      JOIN tarifs t USING (tar_id)
      JOIN vgroups vg ON vg.vg_id = s.vg_id
      JOIN agreements ag ON vg.agrm_id = ag.agrm_id
      WHERE ag.agrm_id = ? AND s.timeto = '9999-12-31 23:59:59'
    SQL
    addons += LbAgreement.connection.exec_query(sql).to_a

    sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
      SELECT us.vg_id, c.descr as descr, round(us.mul*c.above, 2) as amount, t.rent, vg.blocked, vg.acc_ondate, vg.acc_offdate, vg.last_mod_date, cat_idx
      FROM usbox_services us
      JOIN categories c USING (tar_id, cat_idx)
      JOIN tarifs t USING (tar_id)
      JOIN vgroups vg ON vg.vg_id = us.vg_id
      JOIN agreements ag ON vg.agrm_id = ag.agrm_id
      WHERE ag.agrm_id = ? AND us.timeto = '9999-12-31 23:59:59'
    SQL
    addons += LbAgreement.connection.exec_query(sql).to_a

    sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
      SELECT vg.vg_id, vg.agrm_id, ac.login, tf.descr, vg.blocked, vg.acc_ondate, vg.acc_offdate, vg.last_mod_date, tf.rent as amount
      FROM vgroups as vg
      LEFT JOIN tarifs as tf ON vg.tar_id = tf.tar_id
      LEFT JOIN accounts as ac ON vg.uid = ac.uid
      WHERE vg.agrm_id = ?
      ORDER BY vg.blocked ASC, vg.acc_ondate DESC
    SQL
    services = LbAgreement.connection.exec_query(sql).to_a

    services.map! do |s|
      index = 0
      s[:addons] = []
      addons.select{|a| a["vg_id"] == s["vg_id"]}.each do |a|
        if a["cat_idx"] == 0
          s[:amount] = s[:amount].to_f + a["amount"].to_f
          next
        end
        s[:addons] << { key: index+1,
            descr: a["descr"],
            amount: a["amount"].to_f,
            blocked: a["blocked"],
            cat_idx: a["cat_idx"],
            acc_ondate: a["acc_ondate"],
            acc_offdate: a["acc_offdate"],
            last_mod_date: a["last_mod_date"]
          }
      end
      s
    end

    services
  end

  def get_services
    @_services ||= begin
      addons = []
      sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
        SELECT s.vg_id, c.descr, round(s.mul*c.above, 2) as amount, t.descr as name, t.rent
        FROM services s
        JOIN service_categories c USING (tar_id, serv_cat_idx)
        JOIN tarifs t USING (tar_id)
        JOIN vgroups vg ON vg.vg_id = s.vg_id
        JOIN agreements ag ON vg.agrm_id = ag.agrm_id
        WHERE vg.blocked = 0 AND ag.agrm_id = ? AND s.timeto = '9999-12-31 23:59:59'
      SQL
      addons += LbAgreement.connection.exec_query(sql).to_a

      sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
        SELECT us.vg_id, c.descr, round(us.mul*c.above, 2) as amount, t.descr as name, t.rent
        FROM usbox_services us
        JOIN categories c USING (tar_id, cat_idx)
        JOIN tarifs t USING (tar_id)
        JOIN vgroups vg ON vg.vg_id = us.vg_id
        JOIN agreements ag ON vg.agrm_id = ag.agrm_id
        WHERE vg.blocked = 0 AND ag.agrm_id = ? AND us.timeto = '9999-12-31 23:59:59'
      SQL
      addons += LbAgreement.connection.exec_query(sql).to_a

      sql = ActiveRecord::Base.send(:sanitize_sql_array, [<<-SQL, agrm_id])
        SELECT vg.vg_id, t.descr as name, t.rent as amount
        FROM vgroups vg
        JOIN tarifs t ON vg.tar_id = t.tar_id
        JOIN agreements ag ON vg.agrm_id = ag.agrm_id
        WHERE vg.blocked = 0 AND ag.agrm_id = ?
      SQL
      services = LbAgreement.connection.exec_query(sql).to_a

      total_amount = 0
      services.map! do |s|
        s["amount"] = s["amount"].to_f
        total_amount += s["amount"]
        s[:addons] = addons.select{|a| a["vg_id"] == s["vg_id"]}.map do |a|
          { name: a["descr"], amount: a["amount"].to_f }
        end
        total_amount += s[:addons].sum{|a| a[:amount]}
        s.delete("vg_id")
        s
      end

      {
        fee: total_amount,
        services:  services,
      }
    end
  end

  class << self
    def fee(month = Date.today, ids = [])
      date = month.beginning_of_month.strftime("%Y-%m-%d")

      sql = <<-SQL
        SELECT a.agrm_id, (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) as fee
        FROM agreements a
        LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM rentcharge WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 GROUP BY agrm_id) r ON a.agrm_id = r.agrm_id
        LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM usbox_charge WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 GROUP BY agrm_id) u ON a.agrm_id = u.agrm_id
        LEFT JOIN (SELECT agrm_id, sum(amount) as fee FROM charges c WHERE period >= date('#{date}') and period < '#{date}' + interval 1 month AND amount > 0 GROUP BY agrm_id) c ON a.agrm_id = c.agrm_id
        WHERE (COALESCE(r.fee,0) + COALESCE(u.fee,0) + COALESCE(c.fee,0)) > 0
        #{(ids.size > 0) ? "AND a.agrm_id IN (#{ids.join(',')})" : ''}
        GROUP BY a.agrm_id
      SQL

      result = LbAgreement.connection.execute(sql).to_a

      result.each_with_object({}) do |r, memo|
        memo[r[0]] = r[1]
      end
    end
  end
end
