require 'net/telnet'
require 'ruby-asterisk'
module Asterisk
  class AMI
    def initialize
      connect
    end

    def listen
      while true
        begin
          raw = @ami.ping.raw_response
          if block_given?
            parse_response(raw).each do |r|
              yield r
            end
          end
        rescue => e
          if e.class.is_a?(Errno::EPIPE) || e.class.is_a?(Errno::ECONNRESET)
            connect
            login
          else
            raise e
          end
        end
        sleep 1
      end
    end

    def close
      @ami.disconnect
    end

    def parse_response(raw)
      arr = []
      raw.split("\n\n").each do |event|
        h = {}
        event.each_line do |l|
          k,v = l.split(":", 2)
          h[k.to_sym] = v.strip.chomp
        end
        unless %w/Registry Bridge PeerStatus/.include?(h[:Event])
          arr << h
        end
      end
      arr
    end

    def connect
      @ami = RubyAsterisk::AMI.new(ENV["ASTERISK_HOST"], (ENV["ASTERISK_PORT"] || 5038).to_i)
    end

    def login
      @ami.login(ENV["ASTERISK_USER"], ENV["ASTERISK_PASSWORD"])
    end
  end
end
