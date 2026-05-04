class Ability
  include CanCan::Ability

  def initialize(user)

    user ||= User.new # guest user (not logged in)
    if user.admin?
      can :manage, :all
    elsif user.tester?
      can [:read], WorkingDay
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can :read, :all
      can [:read], Project
      can [:read, :personal, :slots_by_week], :TimeSlot
      can [:read, :update], Expense
      can [:read, :fee_payments_report, :search], :LbAgreements
      can [:read, :fee_payments_report, :search], LbAgreement
      can [:read,:update,:help_desk_users, :executors_of_requests, :read], User
    elsif user.developer?
      can :manage, :all
    elsif user.supervisor?
      can :manage, :all
    elsif user.main_billing_manager?
      can :manage, :all
    elsif user.billing_manager?
      can [:read], WorkingDay
      can [:read], :Address
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read, :reload], IrcAccountSaldo
      can [:read], :Billing
      can [:read], Payment
      can [:read, :update, :destroy, :batch_update], LbPayment
      can [:read, :search, :update, :reconciliation_act], :LbAgreements
      can [:read, :search, :update, :reconciliation_act], LbAgreement
      can [:read], LbTelesetCharge
      can [:read, :update], :HelpDesk
      can [:read,:update,:help_desk_users, :executors_of_requests], User
      can [:read, :ur_csv_report], Saldo
      can [:read, :check_port_state, :update], Port
      can [:read], :Reports
      can [:read, :update], :Debtor
      can [:read, :update], Debtor
    elsif user.jurist?
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read, :fee_payments_report, :search, :update], :LbAgreements
      can [:read, :fee_payments_report, :search, :update], LbAgreement
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read,:update,:help_desk_users, :executors_of_requests], User
      can [:read], Project
      can :read, :BlockingServices
      can :read, :SiteManagment
      can :read, :AgreementDocument
      can [:read, :update], Expense
    elsif user.hr_manager?
      can [:read], WorkingDay
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read,:update,:help_desk_users, :executors_of_requests], User
      can [:read], Project
      can [:read, :personal, :slots_by_week], :TimeSlot
      can [:read, :update], Expense
    elsif user.main_manager?
      can [:read], WorkingDay
      can [:read, :report, :create], Call
      can :read, :ConnectionSource
      can :manage, CallReason
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read], :Billing
      can [:read], LbPayment
      can [:read], LbTelesetCharge
      can [:read], PhoneConfirmation
      can [:read], UserRequest
      can [:read], :SiteManagment
      can :read, :AgreementDocument
      can [:read], LkPayment
      can [:read, :search, :update], :LbAgreements
      can [:read, :search, :update], LbAgreement
      can [:read], :Reports
      can [:read], :Teledom
      can [:read], :TeledomRequest
      can [:read], :ManagerSales
      can [:read, :update], :HelpDesk
      can [:read, :personal, :slots_by_week], :TimeSlot
      can [:read,:update, :help_desk_users, :executors_of_requests], User
      can [:read], AsteriskCall
      can [:read, :check_port_state, :update], Port
      can [:read, :connections], Agreement
      can [:read, :archive], Camera
      can [:read], Project
      can :read, :BlockingServices
      can [:read, :update], :Debtor
      can [:read, :update], Debtor
    elsif user.manager?
      can [:read], WorkingDay
      can [:read, :report, :create], Call
      can :read, :ConnectionSource
      can :manage, CallReason
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read], :Billing
      can [:read], LbPayment
      can [:read], LbTelesetCharge
      can [:read], PhoneConfirmation
      can [:read], UserRequest
      can [:read], :SiteManagment
      can :read, :AgreementDocument
      can [:read], LkPayment
      can [:read, :search, :update], :LbAgreements
      can [:read, :search, :update], LbAgreement
      can [:read], :Reports
      can [:read], :Teledom
      can [:read], :TeledomRequest
      can [:read], :ManagerSales
      can [:read, :update], :HelpDesk
      can [:read, :personal, :slots_by_week], :TimeSlot
      can [:read,:update, :help_desk_users, :executors_of_requests], User
      can [:read], AsteriskCall
      can [:read, :check_port_state, :update], Port
      can [:read, :connections], Agreement
      can [:read, :archive], Camera
      can [:read], Project
      can :read, :BlockingServices
    elsif user.main_accountant?
      can [:read], :Billing
      can [:read, :load_sberbank, :load_rschet, :load_minbank_ones], Payment
      can [:read, :update, :destroy, :batch_update], LbPayment
      can [:read, :reserves_report], Saldo
      can [:read], :Reports
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read], LbTelesetCharge
      can [:read], :FeePaymentsReport
      can [:read], LkPayment
      can [:read, :fee_payments_report, :search, :update, :reconciliation_act], :LbAgreements
      can [:read, :fee_payments_report, :search, :update, :reconciliation_act], LbAgreement
      can [:read, :update], :HelpDesk
      can [:read, :personal, :slots_by_week], :TimeSlot
      can [:read,:update,:help_desk_users, :executors_of_requests, :read], User
      can [:read], AsteriskCall
      can [:read, :check_port_state], Port
      can [:read, :connections], Agreement
      can [:read], Project
      can :manage, Expense
    elsif user.accountant?
      can [:read], :Billing
      can [:read, :load_sberbank, :load_rschet, :load_minbank_ones], Payment
      can [:read, :update, :destroy, :batch_update], LbPayment
      can [:read, :reserves_report], Saldo
      can [:read], :Reports
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read], LbTelesetCharge
      can [:read], :FeePaymentsReport
      can [:read], LkPayment
      can [:read, :fee_payments_report, :search, :update, :reconciliation_act], :LbAgreements
      can [:read, :fee_payments_report, :search, :update, :reconciliation_act], LbAgreement
      can [:read, :update], :HelpDesk
      can [:read, :personal], :TimeSlot
      can [:read,:update,:help_desk_users, :executors_of_requests, :read], User
      can [:read], AsteriskCall
      can [:read, :check_port_state], Port
      can [:read, :connections], Agreement
      can [:read], Project
      can [:read, :update], Expense
    elsif user.main_engineer?
      can :manage, WorkingDay
      can :manage, Warehouse
      can :manage, WarehouseMaterial
      can :manage, WarehouseMaterialMove
      can :manage, WarehouseMaterialCategory
      can [:read, :update, :destroy, :create, :brands], Equipment
      can [:read, :update, :destroy, :create], EquipmentType
      can [:read,:update, :warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read, :search], :LbAgreements
      can [:read, :search], LbAgreement
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read, :slots_by_week], :TimeSlot
      can [:read], :Reports
      can [:read], :StatisticServiceRequests
      can [:read], :ConversionTimeSlots
      can [:read, :update], :Debtor
      can [:read, :update], Debtor
      can [:read, :check_port_state, :update], Port
      can [:read, :update, :connections], Agreement
      can [:read], AsteriskCall
      can [:read], Project
      can :read, :BlockingServices
      can [:read, :update], Expense
    elsif user.engineer?
      # - Может смотреть склады
      # - переводить "свое" оборудование на абонента
      # - и с абонента переводить "себе"
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read, :update], Equipment
      can [:read, :update], EquipmentType
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read, :search, :update], :LbAgreements
      can [:read, :search, :update], LbAgreement
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read, :slots_by_week], :TimeSlot
      can [:read, :update], :Debtor
      can [:read, :update], Debtor
      can [:read, :check_port_state, :update], Port
      can [:read, :update, :connections], Agreement
      can :read, :BlockingServices
      can [:read, :home], Camera
      can [:read], Project
      can :manage, WhiteIpAddress
    elsif user.connect_engineer?
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read], Equipment
      can [:read], EquipmentType
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :personal], :TimeSlot
      can [:read, :update], :HelpDesk
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read], LbAgreement
    elsif user.service_engineer?
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read], Equipment
      can [:read], EquipmentType
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :personal], :TimeSlot
      can [:read, :update], :HelpDesk
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read], LbAgreement
    elsif user.technical_engineer?
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read], Equipment
      can [:read], EquipmentType
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :personal], :TimeSlot
      can [:read, :update], :HelpDesk
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read], LbAgreement
      can [:read, :home], Camera
      can [:read], Project
    elsif user.builder_engineer?
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read], Equipment
      can [:read], EquipmentType
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :personal], :TimeSlot
      can [:read, :update], :HelpDesk
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read], LbAgreement
    elsif user.main_video_engineer?
      can :manage, WorkingDay
      can :manage, Warehouse
      can :manage, WarehouseMaterial
      can :manage, WarehouseMaterialMove
      can :manage, WarehouseMaterialCategory
      can [:read, :update, :destroy, :create, :brands], Equipment
      can [:read, :update, :destroy, :create], EquipmentType
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can :manage, Camera
      can :manage, CameraAgreement
      can [:read, :search, :update], :LbAgreements
      can [:read, :search, :update], LbAgreement
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read, :slots_by_week], :TimeSlot
      can [:read], :Reports
      can [:read], :StatisticServiceRequests
      can [:read], :ConversionTimeSlots
      can [:read, :check_port_state, :update], Port
      can [:read, :update, :connections], Agreement
      can [:read], Project
      can [:read, :update], Expense
      can [:read], Teledom
      can [:read], TeledomRequest
      can [:read], :TeledomReport
    elsif user.video_engineer?
      can [:read], WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read], Equipment
      can [:read], EquipmentType
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :personal], :TimeSlot
      can [:read, :update], :HelpDesk
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read, :search], :LbAgreements
      can [:read, :search], LbAgreement
      can :manage, Camera
      can :manage, CameraAgreement
      can [:read], Project
    elsif user.lead_engineer?
      can :manage, WorkingDay
      can :read, Warehouse
      can :read, WarehouseMaterial
      can :read, WarehouseMaterialMove
      can :read, WarehouseMaterialCategory
      can [:read, :update], Equipment
      can [:read, :update], EquipmentType
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read, :search], :LbAgreements
      can [:read, :search], LbAgreement
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read, :slots_by_week], :TimeSlot
      can [:read, :check_port_state, :update], Port
      can [:read, :update, :connections], Agreement
      can [:read], Project
      can [:read, :update], Expense
      can [:read], :Reports
      can [:read], :StatisticServiceRequests
      can [:read], :ConversionTimeSlots
    elsif user.commercial_manager?
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
      can [:read, :search], :LbAgreements
      can [:read, :search], LbAgreement
      can [:read], LbAddressStreet
      can [:read], LbAddressBuilding
      can [:read], :Address
      can [:read, :update], :HelpDesk
      can [:read, :check_port_state, :update], Port
      can [:read, :update, :connections], Agreement
      can [:read], Project
      can [:read, :update], Expense
    elsif user.project_manager?
      can [:read], Project
      can [:read,:update,:warehouse_users,:help_desk_users, :executors_of_requests], User
    elsif user.car?
    end
    # See the wiki for details:
    # https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
  end

  def to_list
    rules.map do |rule|
      object = { actions: rule.actions, subject: rule.subjects.map{ |s| s.is_a?(Symbol) ? s : s.name } }
      object[:conditions] = rule.conditions unless rule.conditions.blank?
      object[:inverted] = true unless rule.base_behavior
      object
    end
  end
end


# - В журнале фильтрация по дате, получателю, исполнителю, ...
# - В хранении фильтрация по категории
# - Вместо Добавить иконку +
# - Редактированить материал
# - Артикул генерим сами
# - Units: литры
