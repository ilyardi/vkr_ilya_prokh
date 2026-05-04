class Agreement < ApplicationRecord
    has_many :vgroups
    belongs_to :lb_agreement, foreign_key: :external_id

    def ports_up
        agreement = LbAgreement.find(self.external_id)

        return unless agreement.present?

        if agreement.balance.to_i >= 0
            self.vgroups.joins(:port).each do |record|
                record.port.change_port_state("up")
                if record.port.errors.size > 0
                    Rails.logger.error "ERROR_CHANGE_PORT_STATE: #{agreement.agrm_id}, balance: #{agreement.balance.to_i}, errors: #{record.port.errors.as_json}"
                end
            end
        else
            Rails.logger.error "CANNOT_UP_PORTS: #{agreement.agrm_id}, balance: #{agreement.balance.to_i}"
        end
    end

    class << self
        def synchronize_db
            agreements = Agreement.all.index_by(&:external_id)
            lb_agreements = LbAgreement.all.to_a
            Agreement.transaction do
                lb_agreements.each{|record|
                    agreement = agreements[record.agrm_id]
                    Agreement.create(external_id: record.agrm_id, number: record.number) unless agreement.present?
                }
            end
            nil
        end

        def get_connections_data(agrm_ids)
            connections = select("ag.external_id AS agrm_id,
                dv.name  AS dv_name,
                dv.ip    AS dv_ip,
                dv.id    AS id,
                p.number AS p_number,
                p.state  AS p_state,
                p.checked_at AS checked_at,
                p.id     AS p_id,
                p.vgroup_id,
                vg.external_id AS vg_id,
                '' AS ip")
            .from('agreements ag')
            .joins("LEFT JOIN vgroups vg ON vg.agreement_id = ag.id")
            .joins("LEFT JOIN ports p ON vg.id = p.vgroup_id")
            .joins("LEFT JOIN devices dv ON dv.id = p.device_id")
            .where("ag.external_id IN (?) AND dv.ip IS NOT NULL", agrm_ids)

            vg_ids = connections.map(&:vg_id)
            ips = Vgroup.get_ips(vg_ids)
            return connections.map do |r|
                r.ip = ips[r.vg_id]
                r
            end
        end
    end
end
