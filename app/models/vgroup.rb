class Vgroup < ApplicationRecord
    belongs_to :agreement
    has_one :port

    def get_ip
        sql = <<-SQL
            SELECT SUBSTRING(INET6_NTOA(segment), 8)
            FROM staff
            WHERE type = 0 AND vg_id = #{external_id}
        SQL
        LbBase.connection.execute(sql).first.try(:first)
    end

    class << self
        def get_ips(vg_ids)
            sql = <<-SQL
                SELECT vg_id, SUBSTRING(INET6_NTOA(segment), 8)
                FROM staff
                WHERE #{LbBase.sanitize_sql(["type = 0 AND vg_id IN (?)", vg_ids])}
            SQL
            LbBase.connection.execute(sql).each_with_object({}) do |row, memo|
                memo[row[0]] = row[1]
            end
        end

        def synchronize_db
            vgroups = Vgroup.all.index_by(&:external_id)

            sql = <<-SQL
                SELECT vg.vg_id, vg.agrm_id, vg.blocked
                FROM vgroups vg
            SQL
            lb_vgroups = LbVgroup.connection.execute(sql).to_a
            agreements = Agreement.all.index_by(&:external_id)

            Vgroup.transaction do
                lb_vgroups.each{|record|
                    vgroup = vgroups[record[0]]
                    if vgroup.present?
                        vgroup.update(blocked: record[2]) if vgroup.blocked != record[2]
                        vgroup.update(agreement_id: agreements[record[1]].id) if agreements[record[1]].present? && (agreements[record[1]].id != vgroup.agreement_id)
                    else
                        Vgroup.create(
                            external_id: record[0],
                            agreement_id: agreements[record[1]] && agreements[record[1]].id,
                            blocked: record[2]
                        )
                    end
                }
            end
            nil
        end
    end
end
