require 'net/ssh'
require 'ipaddr'

class Bras
    def self.listing
        bras_ips = Settings.bras.host.split(",")
        ips = []

        bras_ips.each do |bras_ip|
            rows = ''
            Net::SSH.start(bras_ip, Settings.bras.user, password: Settings.bras.pass) do |ssh|
                rows = ssh.exec!("conf force \r\n edit aclBRAS \r\n ls")
            end

            rows.split("\r\n").each do |line|
                if line.include?("permit ip src")
                    ips << line.match(/\d+\.\d+\.\d+\.\d+/)[0]
                end
            end
        end
        return ips.uniq
    end

    def self.add_ip(ip)
        result = ""
        bras_ips = Settings.bras.host.split(",")
        errors = []
        bras_ips.each do |bras_ip|
            Net::SSH.start(bras_ip, Settings.bras.user, password: Settings.bras.pass) do |ssh|
                ipaddr = IPAddr.new ip
                cmd = "#{ipaddr.to_i} permit ip src #{ipaddr.to_s}~0-4095 dst any"
                result = ssh.exec!("conf force \r\n edit aclBRAS \r\n #{cmd} \r\n apply")
                # CONFIGURATION IS THE SAME
                # APPLY SUCCESS
                if !result.include?('APPLY SUCCESS') && !result.include?('CONFIGURATION IS THE SAME')
                    errors << result
                end
            end
        end

        return errors.size == 0
    end

    def self.del_ip(ip)
        result = ''
        bras_ips = Settings.bras.host.split(",")
        errors = []
        bras_ips.each do |bras_ip|
            Net::SSH.start(bras_ip, Settings.bras.user, password: Settings.bras.pass) do |ssh|
                ipaddr = IPAddr.new ip
                result = ssh.exec!("conf force \r\n edit aclBRAS \r\n no #{ipaddr.to_i} \r\n apply")
                if !result.include?('APPLY SUCCESS') && !result.include?('CONFIGURATION IS THE SAME')
                    errors << result
                end
            end
        end
        return errors.size == 0
    end

    # def self.sync(ip)
    #     ips = listing

    #     Net::SSH.start('193.33.124.8', Settings.bras.user, password: Settings.bras.pass) do |ssh|
    #         ips.each do |ip|
    #             ipaddr = IPAddr.new ip
    #             cmd = "#{ipaddr.to_i} permit ip src #{ipaddr.to_s}~0-4095 dst any"
    #             p ssh.exec!("conf force \r\n edit aclBRAS \r\n #{cmd} \r\n apply")
    #         end
    #     end
    # end
end
