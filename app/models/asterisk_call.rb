class AsteriskCall < ApplicationRecord

    def internal_audio_url
        # /storage/usbdisk1/mikopbx/astspool/monitor/2021/12/03/14/mikopbx-1638532618.223_8a5zfg.mp3
        # https://172.20.17.2/crm/aGTsHYhW6mtQB9BZSkmGzwrxy5pKlhWk/records/2022/11/26/22/mikopbx-1669490157.63434_X7725Q.mp3

        self.recordingfile.sub('/storage/usbdisk1/mikopbx/astspool/monitor/', 'https://172.20.17.2/crm/aGTsHYhW6mtQB9BZSkmGzwrxy5pKlhWk/records/')
    end

    def self.sync(db_file = nil, limit = 1000)
        unless db_file
            db_uri = URI.parse('https://172.20.17.2/crm/aGTsHYhW6mtQB9BZSkmGzwrxy5pKlhWk/cdr.db')

            tempfile = Tempfile.new('cdr',  binmode: true)
            IO.copy_stream(db_uri.open(ssl_verify_mode: OpenSSL::SSL::VERIFY_NONE), tempfile.path)
            tempfile.close

            db_file = tempfile.path
        end

        db = SQLite3::Database.new(db_file)

        lst_call = AsteriskCall.order(start_time_last: :desc).first
        lst_call_data = nil
        unless lst_call.nil?
            lst_call_data = lst_call.start_time_last
        end

        data = db.execute(<<-SQL)
            SELECT
                max(id) as asterisk_id
                , min(start) as start_time
                , max(start) as start_time_last
                , max(endtime) as end_time
                , linkedid
                , src_num as from_num
                , dst_num as to_num
                , src_chan as from_chan
                , dst_chan as to_chan
                , recordingfile
                , min(disposition) as status
            FROM cdr_general as gen
            WHERE (from_chan LIKE '%PJSIP/SIP%' OR to_chan LIKE '%PJSIP/SIP%')
            GROUP BY linkedid
            #{lst_call_data ? "HAVING start_time_last > '#{lst_call_data.strftime("%F %T.%L")}'" : ""}
            ORDER BY start_time_last asc #{limit ? "LIMIT '#{limit}'" : ''}
        SQL

        data.each do |record|
            astr_call = AsteriskCall.find_by(linkedid: record[4])
            if astr_call.present?
                astr_call.update(
                    asterisk_id: record[0],
                    start_time_last: record[2],
                    end_time: record[3],
                    to_num: record[6],
                    to_chan: record[8],
                    recordingfile: record[9],
                    status: record[10],
                )
                next
            end

            AsteriskCall.create(
                asterisk_id: record[0],
                start_time: record[1],
                start_time_last: record[2],
                end_time: record[3],
                linkedid: record[4],
                from_num: record[5],
                to_num: record[6],
                from_chan: record[7],
                to_chan: record[8],
                recordingfile: record[9],
                status: record[10],
            )
        end

        return data.size
    ensure
        tempfile.unlink if tempfile
    end
end
