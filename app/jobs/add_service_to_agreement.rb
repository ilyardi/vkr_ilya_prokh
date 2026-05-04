class AddServiceToAgreementJob < ApplicationJob
  queue_as :default

  rescue_from(ActiveRecord::RecordNotFound) do |exception|
    Rails.logger.error "[AddServiceToAgreement] #{exception.message}"
  end

  def perform(service_type, agrm_id)
    l = Lanbilling.instance
    l.admin_login

    lb_agreement = LbAgreement.find(agrm_id)
    lb_account = lb_agreement.lb_account
    date = Time.now

    building = lb_account.lb_accounts_addrs.connection_type.first&.building
    available_service = AvailableService.find_by(service_type: service_type, building_id: building)

    unless available_service.present?
      raise "Сервис недоступен для указанного адреса!"
    end

    case service_type
    when 'teledom_ud'
      agent_type = 8
      service = 'ud'
    end

    current_vgroup = LbVgroup.find_by(login: lb_account.login+"_#{service}", agrm_id: lb_agreement.agrm_id)

    unless current_vgroup.present?
      vgroup = {
        vgroup: {
          agrmid: lb_agreement.agrm_id,
          id: agent_type,
          uid: lb_agreement.uid,
          login: lb_account.login+"_#{service}",
          pass: lb_account.pass,
        },
        agrmnum: lb_agreement.number,
        username: lb_account.name,
      }
      vgroup_id = l.execute(:insupd_vgroup, val: vgroup)
      sleep(1)
    else
      vgroup_id = current_vgroup.vg_id
    end

    free_tar_rasp = {
      vgid: vgroup_id,
      groupid:0,
      id: agent_type,
      taridnew: available_service.tar_id_free,
      taridold: nil,
      requestby: 0,
      changetime: date.strftime("%Y-%m-%d %H:%M:%S"),
    }
    free_tar_rasp_id = l.execute(:insupd_tarifs_rasp, val: free_tar_rasp)
    sleep(1)

    block_rasp = {
      vgid: vgroup_id,
      blkreq: 0,
      unblockedby: 0,
      changetime: date.strftime("%Y-%m-%d %H:%M:%S"),
      timeto: date.strftime("%Y-%m-%d %H:%M:%S"),
    }
    block_id = l.execute(:ins_blk_rasp, val: block_rasp)
    sleep(1)

    tar_rasp = {
      vgid: vgroup_id,
      groupid:0,
      id: agent_type,
      taridnew: available_service.tar_id,
      taridold: nil,
      requestby: 0,
      changetime: (date.beginning_of_month+1.month).strftime("%Y-%m-%d %H:%M:%S"),
    }
    tar_rasp_id = l.execute(:insupd_tarifs_rasp, val: tar_rasp)
    sleep(1)

    if vgroup_id.present? && free_tar_rasp_id.present? && block_rasp.present? && tar_rasp_id.present?
      lb_agreement.dom_sync
      subscriber_params = {
        last: lb_account.abonent_surname,
        name: lb_account.abonent_name,
        patronymic: lb_account.abonent_patronymic,
        phone: lb_account.phone,
        owner: true,
        strict_mode: false,
        service: service
      }
      lb_agreement.dom_add_subscriber(subscriber_params)
    end
  end
end
