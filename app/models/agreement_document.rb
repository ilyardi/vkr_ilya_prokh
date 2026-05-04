# :title
# :doc_type
# :status, default: :create
# :agrm_id
# :doc_url
# :external_uid
# :archive, default: false

# ANNULED - Аннулирован
# SIGNED - Подписан
# CANCELED - Отклонен
# DELETED - Удален
# SIGNED_PAPER - Подписан на бумаге
# WAIT_SIGN - Ожидает подписание клиентом
# ERROR_ANNUL - Ошибка анулирования
# ERROR_SEND - Ошибка отправки
# ERROR_SIGN - Ошибка подписания

class AgreementDocument < ApplicationRecord
  enum doc_type: { teledom_ud: 'teledom_ud' }
  enum status: {
    created: "created",
    wait_sign: "wait_sign",
    signed: "signed",
    canceled: "canceled",
    annuled: "annuled",
    error: "error"
  }
  enum file_status: {
    file_none: "file_none",
    performing: "performing",
    done: "done",
    file_error: "file_error"
  }
  belongs_to :lb_agreement, foreign_key: :agrm_id

  before_create :generate_fields
  # around_update :get_doc_token, if: Proc.new {|record| record.status_changed? && record.signed?}
  # around_save :get_doc_guid, if: Proc.new {|record| record.doc_token_changed? && record.doc_token.present?}
  before_save :get_doc_guid, if: Proc.new {|record| record.doc_token_changed? && record.doc_token.present?}

  scope :by_agrm, ->(agrm_id) { where(agrm_id: agrm_id) }

  def send_fdoc
    return if self.doc_url.present? || self.status == 'error'
    return if self.status != "created"

    encoded_string = self.generate_ud_doc
    lb_agreement = LbAgreement.find(self.agrm_id)
    lb_account = lb_agreement.lb_account
    client = {
      id: self.agrm_id,
      phone: lb_account.phone,
      name: lb_account.name,
    }
    result = DocManager::Fdoc.new.send_document(encoded_string, self.title, self.external_uid, client)
    if result.success?
      self.doc_url = result.doc_url
      self.status = :wait_sign
    else
      self.doc_error = result.error_message
      self.status = :error
    end
    self.save

    self.errors.add(:send_fdoc, 'ошибка отправки документа') if self.status == "error"
    self
  end

  def approve_service
    AddServiceToAgreementJob.set(wait: 1.second).perform_later(self.doc_type, self.agrm_id)
  end

  def get_doc_token
    puts "[GET_DOC_TOKEN]"
    self.file_status = "performing"
    self.save
    if Rails.env.production?
      GetDocTokenJob.set(wait: 10.second).perform_later(self.id)
    else
      GetDocTokenJob.perform_now(self.id)
    end
  end

  def get_doc_guid
    puts "[GET_DOC_GUID]"
    if Rails.env.production?
      GetDocGuidJob.set(wait: 1.minute).perform_later(self.id)
    else
      GetDocGuidJob.perform_now(self.id)
    end
  end

  def generate_ud_doc
    lb_agreement = LbAgreement.find(self.agrm_id)
    self.errors.add(:agrm, "договор не найден") unless lb_agreement.present?
    lb_account = lb_agreement.lb_account
    self.errors.add(:account, "аккаунт не найден") unless lb_account.present?
    building_id = lb_agreement&.lb_account&.lb_accounts_addrs&.connection_type&.first&.building
    available_service = AvailableService.where(building_id: building_id, service_type: "teledom_ud")&.first
    self.errors.add(:service, "сервис не доступен для данного дома") unless available_service.present?
    tarif = LbTarif.find(available_service&.tar_id)
    amount = tarif&.get_rent
    data = {}

    addr = lb_account.lb_accounts_addrs.where('type = ?', 2).order('uid').first
    reg_addr = lb_account.lb_accounts_addrs.where('type = ?', 0).order('uid').first
    data[:agrm_number] = lb_agreement.number || ''
    data[:full_name] = lb_account.name || ''
    data[:abonent_surname] = lb_account.abonent_surname || ''
    data[:abonent_name] = lb_account.abonent_name || ''
    data[:abonent_patronymic] = lb_account.abonent_patronymic || ''
    data[:abonent_phone] = lb_account.phone || ''
    data[:reg_address] = reg_addr.address || ''
    data[:pass_sernum] = lb_account.pass_sernum || ''
    data[:pass_no] = lb_account.pass_no || ''
    data[:pass_issuedate] = lb_account.pass_issuedate&.strftime("%d.%m.%Y") || ''
    data[:pass_issuedep] = lb_account.pass_issuedep || ''
    data[:birthplace] = lb_account.birthplace || ''
    data[:birthdate] = lb_account.birthdate&.strftime("%d.%m.%Y") || ''
    data[:phone] = lb_account.phone || ''
    data[:email] = lb_account.email || ''
    data[:amount] = amount || ''

    if addr.present?
        data[:street] = (addr.lb_address_street.name if addr.lb_address_street.present?) || ''
        data[:building] = ([addr.lb_address_building.name, addr.lb_address_building.block].reject(&:blank?).join("/") if addr.lb_address_building.present?) || ''
        data[:entrance] = (addr.lb_address_entrance.name if addr.lb_address_entrance.present?) || ''
        data[:flat] = (addr.lb_address_flat.name if addr.lb_address_flat.present?) || ''
        data[:floor] = (addr.lb_address_floor.name if addr.lb_address_floor.present?) || ''
    end

    pdf_template = Prawn::Document.new(:page_size => "A4", :background => "public/images/templates_docs/teleset_ud.png", :background_scale => 0.35 ) do |pdf|
      pdf.font_families.update(
        "UltimaPro" => {
          :normal  => "public/UltimaPro.ttf" }
      )
      pdf.font "UltimaPro", :size => 8
      pdf.draw_text data[:abonent_surname], at: [72, 690]
      pdf.draw_text data[:abonent_name], at: [210, 690]
      pdf.draw_text data[:abonent_patronymic], at: [380, 690]
      pdf.draw_text data[:reg_address], at: [105, 668]
      pdf.draw_text data[:pass_sernum], at: [100, 645]
      pdf.draw_text data[:pass_no], at: [210, 645]
      pdf.draw_text data[:pass_issuedate], at: [400, 645]
      pdf.draw_text data[:pass_issuedep], at: [90, 622]
      pdf.draw_text data[:birthplace], at: [105, 600]
      pdf.draw_text data[:birthdate], at: [415, 600]
      pdf.draw_text data[:phone], at: [80, 579]
      pdf.draw_text data[:email], at: [258, 579]
      pdf.draw_text data[:flat], at: [350, 517]
      pdf.draw_text data[:building], at: [75, 500]
      pdf.draw_text data[:street], at: [150, 500]
      pdf.draw_text data[:amount], at: [280,458]
      pdf.draw_text Time.now.strftime("%d.%m.%Y"), at: [80, 155], size: 10
      pdf.draw_text data[:full_name], at: [80, 130], size: 10
    end
    file_content = pdf_template.render
    encoded_string = Base64.strict_encode64(file_content)
    encoded_string
  end

  private

  def generate_fields
    self.external_uid = SecureRandom.uuid
    case self.doc_type
    when 'teledom_ud'
      self.title = "Соглашение Умный домофон от #{Time.now.strftime("%d.%m.%Y")}"
    end
  end
end
