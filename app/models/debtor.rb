class Debtor < ApplicationRecord
    belongs_to :lb_agreement, foreign_key: :agrm_id
    belongs_to :request, foreign_key: :request_id
    enum status: {
        default: 'default',
        impossible: 'impossible',
        disconnected: 'disconnected',
    }
    enum agrm_type: {
        tv: 'tv',
        tv_int: 'tv_int',
        int: 'int',
        svn: 'svn',
        ud: 'ud',
    }

    def self.find_mono_debtors (month = Date.today-1.month)
        st_date = month.beginning_of_month.strftime("%Y-%m-%d")
        end_date = month.end_of_month.strftime("%Y-%m-%d")

        sql = <<-SQL
            SELECT ag.number, a.phone, a.mobile, address_format(2, ag.uid, '%s. %S, %B, %f. %F') as address, ag.balance, tc.fee, vg.tar_id, t.descr, ag.agrm_id
            FROM vgroups vg
            LEFT JOIN accounts a USING(uid)
            LEFT JOIN agreements ag USING(uid)
            LEFT JOIN tarifs t ON t.tar_id = vg.tar_id
            LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
            WHERE vg.uid IN (
                SELECT vg.uid
                FROM vgroups vg
                WHERE vg.archive = 0 AND NOT(vg.blocked = 10)
                GROUP BY vg.uid
                HAVING COUNT(distinct id) = 1
                ) AND vg.uid NOT IN (
                    SELECT uid
                    FROM usergroups_staff
                    WHERE group_id >= 2
                ) AND a.type = 2 AND vg.id = 2 AND vg.blocked = 0 AND ag.balance*-1 > tc.fee*2 AND fee > 0
                AND t.descr NOT LIKE '%Блокировка%'
        SQL
        result = LbAgreement.connection.execute(sql).to_a

        prev_month = month - 1.month
        prev_debtors = Debtor.where(created_at: prev_month.beginning_of_month..prev_month.end_of_month, agrm_type: :tv).index_by(&:agrm_id)
        curr_debtors = Debtor.where(created_at: st_date..end_date, agrm_type: :tv).index_by(&:agrm_id)

        Debtor.transaction do
            result.each {|record|
                next if curr_debtors[record[8]].present?
                Debtor.create(
                    status: prev_debtors[record[8]].present? && prev_debtors[record[8]].status != "paid" ? prev_debtors[record[8]].status : :default,
                    agrm_type: :tv,
                    balance: record[4],
                    fee: record[5],
                    tar_ids: [record[6]],
                    agrm_id: record[8],
                    created_at: month.beginning_of_month
                )
            }
        end
    end

    def self.find_packet_debtors (month = Date.today-1.month)
        st_date = month.beginning_of_month.strftime("%Y-%m-%d")
        end_date = month.end_of_month.strftime("%Y-%m-%d")

        if Time.now.day >= 10
            sql = <<-SQL
                SELECT ag.agrm_id, ag.number, tars, tc.fee, ag.balance, t.blocked, t.ip
                FROM (
                    SELECT vg.agrm_id, GROUP_CONCAT(t.tar_id, '') as tars, GROUP_CONCAT(t.descr, '') as tars_name, GROUP_CONCAT(vg.blocked, '') as blocked, GROUP_CONCAT(SUBSTRING(INET6_NTOA(s.segment), 8), ' ') as ip
                    FROM vgroups vg
                    LEFT JOIN tarifs t ON (t.tar_id=vg.tar_id)
                    LEFT JOIN staff s ON (s.vg_id = vg.vg_id)
                    WHERE vg.archive=0 AND vg.blocked = 0
                    GROUP BY vg.agrm_id -- HAVING COUNT(vg.tar_id) >= 2
                ) t
                LEFT JOIN agreements ag ON t.agrm_id=ag.agrm_id
                LEFT JOIN agreements_ext ag_ext ON ag_ext.agrm_id=ag.agrm_id
                LEFT JOIN accounts a ON ag.uid=a.uid
                LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
                WHERE balance*-1 >= fee
                    AND fee > 0
                    AND t.ip IS NOT NULL
                    AND ag_ext.payment_method = 1
                    AND a.bill_delivery = 4
                    AND tars_name NOT LIKE '%Блокировка%'
            SQL
        else
            sql = <<-SQL
                SELECT ag.agrm_id, ag.number, tars, tc.fee, ag.balance, t.blocked, t.ip
                FROM (
                    SELECT vg.agrm_id, GROUP_CONCAT(t.tar_id, '') as tars, GROUP_CONCAT(t.descr, '') as tars_name, GROUP_CONCAT(vg.blocked, '') as blocked, GROUP_CONCAT(SUBSTRING(INET6_NTOA(s.segment), 8), ' ') as ip
                    FROM vgroups vg
                    LEFT JOIN tarifs t ON (t.tar_id=vg.tar_id)
                    LEFT JOIN staff s ON (s.vg_id = vg.vg_id)
                    WHERE vg.archive=0 AND vg.blocked = 0
                    GROUP BY vg.agrm_id -- HAVING COUNT(vg.tar_id) >= 2
                ) t
                LEFT JOIN agreements ag ON t.agrm_id=ag.agrm_id
                LEFT JOIN agreements_ext ag_ext ON ag_ext.agrm_id=ag.agrm_id
                LEFT JOIN accounts a ON ag.uid=a.uid
                LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
                WHERE balance*-1 > fee
                    AND fee > 0
                    AND t.ip IS NOT NULL
                    AND ag_ext.payment_method = 1
                    AND tars_name NOT LIKE '%Блокировка%'
            SQL
        end

        result = LbAgreement.connection.execute(sql).to_a

        prev_month = month - 1.month
        prev_debtors = Debtor.where(created_at: prev_month.beginning_of_month..prev_month.end_of_month).index_by(&:agrm_id)
        curr_debtors = Debtor.where(created_at: st_date..end_date, agrm_type: :tv_int).index_by(&:agrm_id)

        Debtor.transaction do
            result.each {|record|
                next if curr_debtors[record[0]].present?
                Debtor.create(
                    status: prev_debtors[record[0]].present? && prev_debtors[record[0]].status != "paid" ? prev_debtors[record[0]].status : :default,
                    agrm_type: :tv_int,
                    balance: record[4],
                    fee: record[3],
                    tar_ids: record[2].present? ? record[2].split(',') : null,
                    agrm_id: record[0],
                    created_at: month.beginning_of_month
                )
            }
        end
    end

    def self.find_int_debtors (month = Date.today-1.month)
        st_date = month.beginning_of_month.strftime("%Y-%m-%d")
        end_date = month.end_of_month.strftime("%Y-%m-%d")

        sql = <<-SQL
            SELECT ag.agrm_id, ag.number, tars, tc.fee, ag.balance, t.blocked, t.ip
            FROM (
            SELECT vg.agrm_id, GROUP_CONCAT(t.tar_id, '') as tars, GROUP_CONCAT(t.descr, '') as tars_name, GROUP_CONCAT(vg.blocked, '') as blocked, GROUP_CONCAT(SUBSTRING(INET6_NTOA(s.segment), 8), ' ') as ip
            FROM vgroups vg
            LEFT JOIN tarifs t ON (t.tar_id=vg.tar_id)
            LEFT JOIN staff s ON (s.vg_id = vg.vg_id)
            WHERE vg.archive=0 AND vg.blocked = 0
            GROUP BY vg.agrm_id -- HAVING COUNT(vg.tar_id) >= 2
            ) t
            LEFT JOIN agreements ag ON t.agrm_id=ag.agrm_id
            LEFT JOIN agreements_ext ag_ext ON ag_ext.agrm_id=ag.agrm_id
            LEFT JOIN accounts a ON ag.uid=a.uid
            LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
            WHERE balance < 0
            AND fee > 0
            AND t.ip IS NOT NULL
            AND ag_ext.payment_method = 2 -- 0 - Авансовый, 1 - Кредитный, 2 - Смешанный
            AND tars_name NOT LIKE '%Блокировка%'
        SQL

        result = LbAgreement.connection.execute(sql).to_a

        prev_month = month - 1.month
        prev_debtors = Debtor.where(created_at: prev_month.beginning_of_month..prev_month.end_of_month).index_by(&:agrm_id)

        Debtor.transaction do
            result.each {|record|
                Debtor.create(
                    status: prev_debtors[record[8]].present? && prev_debtors[record[8]].status != "paid" ? prev_debtors[record[8]].status : :default,
                    agrm_type: :int,
                    balance: record[4],
                    fee: record[3],
                    tar_ids: record[2].present? ? record[2].split(',') : null,
                    agrm_id: record[0],
                    created_at: month.beginning_of_month
                )
            }
        end
    end

    def self.find_service_debtors (month = Date.today-1.month)
        st_date = month.strftime("%Y-%m-%d")
        end_date = (month-30.day).strftime("%Y-%m-%d")
        sql = <<-SQL
            SELECT s.vg_id, c.descr, ag.agrm_id, ag.number, c.above, s.timefrom, s.timeto, ag.balance
            FROM services s
            JOIN service_categories c USING (tar_id, serv_cat_idx)
            JOIN tarifs t USING (tar_id)
            JOIN vgroups vg ON vg.vg_id = s.vg_id
            JOIN agreements ag ON vg.agrm_id = ag.agrm_id
            WHERE c.rent_period = 0
                AND c.above > 1000
                AND ag.balance < 0
                AND s.timefrom > '2022-11-01'
                AND s.timefrom < '2022-12-01'
        SQL
    end

    def self.find_svn_debtors (month = Date.today-1.month)
        st_date = month.beginning_of_month.strftime("%Y-%m-%d")
        end_date = month.end_of_month.strftime("%Y-%m-%d")
        sql = <<-SQL
            SELECT ag.number, a.phone, a.mobile, address_format(2, ag.uid, '%s. %S, %B, %f. %F') as address, ag.balance, tc.fee, vg.tar_id, t.descr, ag.agrm_id
            FROM vgroups vg
            LEFT JOIN accounts a USING(uid)
            LEFT JOIN agreements ag USING(uid)
            LEFT JOIN tarifs t ON t.tar_id = vg.tar_id
            LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
            WHERE vg.uid IN (
                SELECT vg.uid
                FROM vgroups vg
                WHERE vg.archive = 0
                GROUP BY vg.uid
                HAVING COUNT(distinct id) = 1
                )
                AND vg.tar_id IN (
                SELECT t.tar_id
                FROM tarifs t
                WHERE t.descr LIKE '%видео%'
                )
                AND a.type = 2 AND vg.blocked = 0 AND ag.balance*-1 >= tc.fee AND fee > 0
        SQL
        result = LbAgreement.connection.execute(sql).to_a

        prev_month = month - 1.month
        prev_debtors = Debtor.where(created_at: prev_month.beginning_of_month..prev_month.end_of_month, agrm_type: :svn).index_by(&:agrm_id)
        curr_debtors = Debtor.where(created_at: st_date..end_date, agrm_type: :svn).index_by(&:agrm_id)

        Debtor.transaction do
            result.each {|record|
                next if curr_debtors[record[8]].present?
                Debtor.create(
                    status: prev_debtors[record[8]].present? && prev_debtors[record[8]].status != "paid" ? prev_debtors[record[8]].status : :default,
                    agrm_type: :svn,
                    balance: record[4],
                    fee: record[5],
                    tar_ids: [record[6]],
                    agrm_id: record[8],
                    created_at: month.beginning_of_month
                )
            }
        end
    end

    def self.find_ud_debtors (month = Date.today-1.month)
        st_date = month.beginning_of_month.strftime("%Y-%m-%d")
        end_date = month.end_of_month.strftime("%Y-%m-%d")
        sql = <<-SQL
            SELECT ag.number, a.phone, a.mobile, address_format(2, ag.uid, '%s. %S, %B, %f. %F') as address, ag.balance, tc.fee, vg.tar_id, t.descr, ag.agrm_id
            FROM vgroups vg
            LEFT JOIN accounts a USING(uid)
            LEFT JOIN agreements ag USING(uid)
            LEFT JOIN tarifs t ON t.tar_id = vg.tar_id
            LEFT JOIN teleset_charges tc ON tc.agrm_id = ag.agrm_id AND tc.month = '#{st_date}'
            WHERE vg.uid IN (
                SELECT vg.uid
                FROM vgroups vg
                WHERE vg.archive = 0
                GROUP BY vg.uid
                HAVING COUNT(distinct id) = 1
                )
                AND vg.tar_id IN (
                SELECT t.tar_id
                FROM tarifs t
                WHERE t.descr LIKE '%домоф%'
                )
                AND a.type = 2 AND vg.blocked = 0 AND ag.balance*-1 >= tc.fee AND fee > 0
        SQL
        result = LbAgreement.connection.execute(sql).to_a

        prev_month = month - 1.month
        prev_debtors = Debtor.where(created_at: prev_month.beginning_of_month..prev_month.end_of_month, agrm_type: :ud).index_by(&:agrm_id)
        curr_debtors = Debtor.where(created_at: st_date..end_date, agrm_type: :ud).index_by(&:agrm_id)

        Debtor.transaction do
            result.each {|record|
                next if curr_debtors[record[8]].present?
                Debtor.create(
                    status: prev_debtors[record[8]].present? && prev_debtors[record[8]].status != "paid" ? prev_debtors[record[8]].status : :default,
                    agrm_type: :ud,
                    balance: record[4],
                    fee: record[5],
                    tar_ids: [record[6]],
                    agrm_id: record[8],
                    created_at: month.beginning_of_month
                )
            }
        end
    end

    def self.current_debtor?(agrm_id:)
        month = Time.now.beginning_of_month-1.month
        debtor = Debtor.find_by(agrm_id: agrm_id, created_at: month)
        return false unless debtor.present?
        agreement = LbAgreement.includes(:lb_account, :lb_teleset_charges).find(agrm_id)

        fee = agreement.lb_teleset_charges.last.fee
        bill_delivery = agreement.lb_account.bill_delivery

        case debtor.agrm_type
        when 'tv'
            return true if -1*agreement.balance > fee*2
        when 'svn'
            return true if -1*agreement.balance >= fee
        when 'ud'
            return true if -1*agreement.balance >= fee
        when 'tv_int'
            return false if bill_delivery != 'email'
            return true if (Time.now.day < 11 && -1*agreement.balance > fee)
            return true if (Time.now.day >= 11 && agreement.balance < 0)
        when 'int'
            return true if agreement.balance < 0
        end
        return false
    end
end
