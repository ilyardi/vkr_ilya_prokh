require 'snmp'

module Snmp
    class SnmpManager
        @@port_states = {
            '1' => 'up',
            '2' => 'down',
        }

        def initialize(host)
            connect(host)
        end

        def connect(host)
            @snmp_manager = SNMP::Manager.new(host: host, community: 'management')
        end

        def get_port_state(port_number)
            begin
                result = @snmp_manager.get(["1.3.6.1.2.1.2.2.1.7.#{port_number}"]).varbind_list.first.value.to_s
            rescue => exception
                Rails.logger.warn "[SnmpManager] #{exception}"
                return false
            end
            @@port_states[result]
        end

        def set_port_state(port_number, state)
            return state unless Rails.env.production?

            new_state = state == "up" ? 1 : 2
            varbind = SNMP::VarBind.new("1.3.6.1.2.1.2.2.1.7.#{port_number}", SNMP::Integer.new(new_state))
            begin
                result = @snmp_manager.set(varbind).varbind_list.first.value.to_s
                self._save_settings
            rescue => exception
                Rails.logger.warn "[SnmpManager] #{exception}"
                return false
            end
            @@port_states[result]
        end

        private

        def _save_settings
            varbind = SNMP::VarBind.new("1.3.6.1.4.1.27514.100.1.6.0", SNMP::Integer.new(1))
            begin
                result = @snmp_manager.set(varbind)
            rescue => exception
                Rails.logger.warn "[SnmpManager] #{exception}"
                return false
            end
            result
        end
    end
end
