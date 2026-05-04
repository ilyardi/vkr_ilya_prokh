module DocManager
  class Fdoc
    def initialize
    end

    def client
      @client ||= Faraday.new(Settings.fdoc.url)
    end

    def send_document(encoded_string, title, external_uid, client_info)
      args = {
        documents: [
          {
            id: external_uid,
            name: "#{title}.pdf",
            file: encoded_string,
            unsignExpiredDate: Time.now+20.minute
          }
        ],
        client: client_info,
        package: {
          id: external_uid,
          operatorAutoSign: true,
        }
      }

      res = client.post("opengate/api/v1/document") do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers["Authorization"] = "#{get_token}"
        req.body = args.to_json
      end

      Rails.logger.debug "[FDoc#send_document] #{res.as_json}"
      ::DocManager::FdocResponse.new(res)
    end

    def download_document(doc_token, guid)
      res = client.get("archive-srv/api/v1/archive/#{doc_token}/download/#{guid}") do |req|
        req.headers['Content-Type'] = 'application/json'
      end
    end

    def get_token
      args = {
        apiKey: Settings.fdoc.api_key,
        grant: Base64.encode64("#{Settings.fdoc.user}:#{Settings.fdoc.pass}"),
        app: Settings.fdoc.app,
        corpId: Settings.fdoc.corp_id,
        grantType: "password",
      }
      res = client.post("opengate/api/v1/operator/accessToken") do |req|
        req.headers['Content-Type'] = 'application/json'
        req.body = args.to_json
      end
      body = JSON.parse(res.body)
      access_token = body["accessToken"]
      access_token
    end

    def get_doc_token(uid)
      res = client.post("opengate/api/v1/corp/archives/document") do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers["Authorization"] = "#{get_token}"
        req.body = {
          id: uid,
          idType: "document",
          needQesSig: false
        }.to_json
      end
      body = JSON.parse(res.body)
      doc_token = body["token"]
      doc_token
    end

    def get_doc_guid(doc_token)
      res = client.post("archive-srv/api/v1/archive/package") do |req|
        req.headers['Content-Type'] = 'application/json'
        req.body = {
          token: doc_token
        }.to_json
      end
      body = JSON.parse(res.body)
      guid = body["data"]["packageArchives"].first["guid"]
      guid
    end

    def self.get_corp_id
      agent = Faraday.new(Settings.fdoc.url) do |conn|
        conn.request :basic_auth, Settings.fdoc.app_login, Settings.fdoc.app_pass
      end
      res = agent.get("opengate/api/v1/verifyApiKey?apiKey=#{Settings.fdoc.api_key}") do |req|
        req.headers['Content-Type'] = 'application/json'
      end
      corp_id = JSON.parse(res.body)["corpId"]
      corp_id
    end
  end
end
