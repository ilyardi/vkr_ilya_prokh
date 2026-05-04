class Camera < ApplicationRecord
    SIGN_SECRET = "37ILZFSeDUtdszjy0X1CzgRSBvdDUwnrQHw6xQQWYYbBGldSAWR9GP"

    enum camera_type: { free: 'free', home: 'home', business: 'business' }
    # server_id => { 1: 'flussonic 1'),(2: 'flussonic 2' }

    has_many :camera_agreements, dependent: :destroy

    validates :token, :name, :camera_type, :rtsp_url, presence: true
    validates :street, presence: true, if: :home?
    # validates :building, presence: true, numericality: {only_integer: true, greater_than: 0}, if: :home?
    validates :building, presence: true, if: :home?
    validates :longitude, :latitude, numericality: {greater_than_or_equal_to: 0}

    before_save ->(camera) {
        if camera.secure_token.blank?
            camera.secure_token = SecureRandom.hex(16);
        end
    }

    scope :active, -> { where(active: true) }
    scope :ordered, -> { order('name ASC') }
    scope :is_private, ->(b) { where(is_private: b) }
    scope :free, -> { is_private(false).where("street = '' OR street IS NULL") }
    scope :by_address, ->(s,b) { where(street: s, building: b) }
    scope :by_agrm, ->(id) { joins(:camera_agreements).where(camera_agreements: { agrm_id: id}) }

    def hls_url
        "#{Settings.site_host}/api/cameras/#{self.slug}"
    end

    def screenshot_url
        "#{Settings.site_host}/api/cameras/#{self.slug}/screenshot"
    end

    def download_url
        "#{Settings.site_host}/api/cameras/#{self.slug}/download"
    end

    def archive_url
        "#{Settings.site_host}/api/cameras/#{self.slug}/archive"
    end

    def generate_camera_token(remote_ip, lifetime = 3600)
        if self.secure_token.blank?
            return nil
        end

        starttime = Time.now.to_i - 300 # 300 is desync
        endtime = Time.now.to_i + lifetime
        salt = rand(8**8).to_s(8)

        hash = Digest::SHA1.hexdigest(self.token + remote_ip + starttime.to_s + endtime.to_s + self.secure_token + salt)

        return hash + '-' + salt + '-' + endtime.to_s + '-' + starttime.to_s
    end
end
