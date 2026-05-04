class Device < ApplicationRecord
    has_many :ports
    def self.synchronize_db
        devices = Device.all.index_by(&:external_id)

        sql = <<-SQL
            SELECT d.device_id, d.device_name, dopt.value
            FROM devices d
            LEFT JOIN devices_options dopt ON (d.device_id = dopt.device_id AND dopt.name = 'IP')
        SQL

        lb_devices = LbDevice.connection.execute(sql).to_a

        Device.transaction do
            lb_devices.each{|record|
                device = devices[record[0]]
                if device.present?
                    device.update( name: record[1], ip: record[2] )
                else
                    Device.create( external_id: record[0], name: record[1], ip: record[2] )
                end
            }
        end
        nil
    end
end
