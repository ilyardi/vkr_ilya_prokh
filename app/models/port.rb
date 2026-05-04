class Port < ApplicationRecord
    belongs_to :device
    belongs_to :vgroup

    has_paper_trail skip: [:id, :created_at, :updated_at, :number, :device_id, :vgroup_id, :checked_at], versions: {
        scope: -> {order('created_at desc')}
    }

    enum state: {
        up: "up",
        down: "down",
        unknown: "unknown",
        redirect: "redirect",
    }

    def self.synchronize_db
        ports = Port.all.index_by(&:external_id)
        devices = Device.all.index_by(&:external_id)
        vgroups = Vgroup.all.index_by(&:external_id)

        sql = <<-SQL
            SELECT p.port_id as external_id, p.name as number, p.device_id as ext_device_id, p.vg_id as ext_vg_id
            FROM ports p
        SQL
        lb_ports = LbDevice.connection.execute(sql).to_a

        Port.transaction do
            lb_ports.each{|record|
                port = ports[record[0]]
                Port.create(
                    external_id: record[0],
                    number: record[1],
                    device_id: devices[record[2]] && devices[record[2]].id,
                    vgroup_id: vgroups[record[3]] && vgroups[record[3]].id,
                ) unless port.present?
                port.update(
                    number: record[1],
                    device_id: devices[record[2]] && devices[record[2]].id,
                    vgroup_id: vgroups[record[3]] && vgroups[record[3]].id,
                ) if port.present?
            }
        end
        nil
    end

    def change_port_state(new_state)
        return false unless self.device.present?

        case new_state.to_s
        when 'redirect'
            ip = vgroup.get_ip

            result = Snmp::SnmpManager.new(self.device.ip).set_port_state(self.number, 'up')
            self.errors.add(:base, "порт не обнаружен") if result.nil?
            self.errors.add(:base, "ошибка подключения") unless result

            if self.errors.size == 0
                res_bras = Bras.add_ip(ip)
                self.errors.add(:base, "ошибка включения редиректа") unless res_bras
            end

            self.update(state: 'redirect', checked_at: Time.now()) if self.errors.size == 0

            return
        else
            if self.redirect?
                ip = vgroup.get_ip
                res = Bras.del_ip(ip)

                self.errors.add(:base, "ошибка выключения редиректа") unless res
            end
        end

        result = Snmp::SnmpManager.new(self.device.ip).set_port_state(self.number, new_state)

        self.errors.add(:base, "порт не обнаружен") if result.nil?
        self.errors.add(:base, "ошибка подключения") unless result

        self.update(state: result, checked_at: Time.now()) if self.errors.size == 0
    end

    def check_port_state
        return false unless self.device.present?

        result = Snmp::SnmpManager.new(self.device.ip).get_port_state(self.number)

        self.errors.add(:base, "порт не обнаружен") if result.nil?
        self.errors.add(:base, "ошибка подключения") unless result

        self.update(state: result, checked_at: Time.now()) if self.errors.size == 0

        check_redirect_state if self.up?

        self
    end

    def check_redirect_state
        ips = Bras.listing
        ip = vgroup.get_ip

        self.update(state: :redirect, checked_at: Time.now()) if ips.include?(ip)
    end
end
